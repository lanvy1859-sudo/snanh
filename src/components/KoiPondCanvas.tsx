import React, { useEffect, useRef, useState } from 'react';
import { KoiFishData } from '../types';
import { soundManager } from '../utils/audio';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface FoodPellet {
  x: number;
  y: number;
  life: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  color: string;
  width: number;
  height: number;
  floating: boolean;
  targetWaterY: number;
  life: number;
}

interface WaterSparkle {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
}

interface LilyPad {
  relX: number;
  relY: number;
  radius: number;
  rotation: number;
  notchAngle: number;
  colorStart: string;
  colorEnd: string;
  hasFlower?: boolean;
  flowerHue?: string;
  dewDrops: { dx: number; dy: number; r: number }[];
  phase: number;
  tilt: number;
}

interface FloatingLeaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  width: number;
  angle: number;
  rotSpeed: number;
  color: string;
  phase: number;
}

// Calculate targets favoring wide visible outer corridors around the central flipbook card
function getRandomKoiTarget(width: number, height: number): { x: number; y: number } {
  const m = 25; // allow swimming close to edges for wide range
  const centerX = width / 2;
  const centerY = height / 2;
  const cardHalfW = Math.min(width * 0.44, 380);
  const cardHalfH = Math.min(height * 0.42, 320);

  const leftZoneAvailable = (centerX - cardHalfW) > (m + 40);
  const rightZoneAvailable = (width - m - (centerX + cardHalfW)) > 40;
  const topZoneAvailable = (centerY - cardHalfH) > (m + 30);
  const bottomZoneAvailable = (height - m - (centerY + cardHalfH)) > 30;

  // Weighted random: 88% in outer visible corridors/corners, 12% across pond
  const roll = Math.random();

  if (roll < 0.25 && leftZoneAvailable) {
    // Left flank corridor (wide vertical swimming path)
    return {
      x: m + Math.random() * (centerX - cardHalfW - m),
      y: m + Math.random() * (height - m * 2),
    };
  } else if (roll < 0.50 && rightZoneAvailable) {
    // Right flank corridor (wide vertical swimming path)
    return {
      x: (centerX + cardHalfW) + Math.random() * (width - m - (centerX + cardHalfW)),
      y: m + Math.random() * (height - m * 2),
    };
  } else if (roll < 0.70 && topZoneAvailable) {
    // Top corridor (wide horizontal path across upper water)
    return {
      x: m + Math.random() * (width - m * 2),
      y: m + Math.random() * (centerY - cardHalfH - m),
    };
  } else if (roll < 0.90 && bottomZoneAvailable) {
    // Bottom corridor (wide horizontal path across lower water)
    return {
      x: m + Math.random() * (width - m * 2),
      y: (centerY + cardHalfH) + Math.random() * (height - m - (centerY + cardHalfH)),
    };
  } else {
    // Four outer corners & perimeter sweeps
    const cornerPads = [
      { x: m + Math.random() * Math.min(220, width * 0.28), y: m + Math.random() * Math.min(180, height * 0.28) },
      { x: width - m - Math.random() * Math.min(220, width * 0.28), y: m + Math.random() * Math.min(180, height * 0.28) },
      { x: m + Math.random() * Math.min(220, width * 0.28), y: height - m - Math.random() * Math.min(180, height * 0.28) },
      { x: width - m - Math.random() * Math.min(220, width * 0.28), y: height - m - Math.random() * Math.min(180, height * 0.28) },
      { x: m + 15, y: centerY + (Math.random() - 0.5) * (height * 0.6) },
      { x: width - m - 15, y: centerY + (Math.random() - 0.5) * (height * 0.6) },
      { x: centerX + (Math.random() - 0.5) * (width * 0.7), y: m + 20 },
      { x: centerX + (Math.random() - 0.5) * (width * 0.7), y: height - m - 20 },
    ];
    return cornerPads[Math.floor(Math.random() * cornerPads.length)];
  }
}

interface KoiPondCanvasProps {
  interactive?: boolean;
  speedMultiplier?: number;
  pondColor?: string;
  onFeed?: () => void;
  confettiTrigger?: number;
}

export const KoiPondCanvas: React.FC<KoiPondCanvasProps> = ({
  interactive = true,
  speedMultiplier = 1,
  pondColor = 'rgba(56, 189, 248, 0.12)',
  onFeed,
  confettiTrigger = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fishRef = useRef<KoiFishData[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const foodRef = useRef<FoodPellet[]>([]);
  const confettiRef = useRef<ConfettiParticle[]>([]);
  const sparklesRef = useRef<WaterSparkle[]>([]);
  const lilyPadsRef = useRef<LilyPad[]>([]);
  const leavesRef = useRef<FloatingLeaf[]>([]);
  const animFrameId = useRef<number | null>(null);
  const [foodCount, setFoodCount] = useState(0);
  const [confettiEatenCount, setConfettiEatenCount] = useState(0);
  const lastJumpTime = useRef<number>(Date.now());

  // Listen for confetti shower trigger from parent (Page 2)
  useEffect(() => {
    if (confettiTrigger > 0 && canvasRef.current) {
      spawnConfettiShower();
    }
  }, [confettiTrigger]);

  const spawnConfettiShower = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const colors = [
      '#ef4444', // red
      '#f97316', // orange
      '#fbbf24', // gold
      '#38bdf8', // sky
      '#f43f5e', // rose
      '#10b981', // emerald
      '#a855f7', // purple
      '#ec4899', // pink
    ];

    const count = 75;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvas.width;
      const y = -20 - Math.random() * 200;
      confettiRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 3.5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.12,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 8 + Math.random() * 6,
        height: 5 + Math.random() * 5,
        floating: false,
        targetWaterY: 80 + Math.random() * (canvas.height - 140),
        life: 1.0,
      });
    }

    soundManager.playChime(660);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize 18 graceful Red Koi fish spread widely across outer visible corridors
    const types: KoiFishData['colorType'][] = [
      'scarlet_kohaku',
      'crimson_red',
      'tancho_crown',
      'coral_white',
      'scarlet_kohaku',
      'crimson_red',
      'tancho_crown',
      'coral_white',
      'scarlet_kohaku',
      'crimson_red',
      'tancho_crown',
      'coral_white',
      'scarlet_kohaku',
      'crimson_red',
      'tancho_crown',
      'scarlet_kohaku',
      'crimson_red',
      'coral_white',
    ];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const cardHalfW = Math.min(canvas.width * 0.44, 380);
    const cardHalfH = Math.min(canvas.height * 0.42, 320);

    fishRef.current = types.map((colorType, idx) => {
      // Distribute spawn points into 4 visible peripheral corridors (left, right, top, bottom, corners)
      let spawnX = 0;
      let spawnY = 0;
      const zone = idx % 5;
      const m = 35;

      if (zone === 0 && centerX - cardHalfW > m + 40) {
        // Left flank
        spawnX = m + Math.random() * (centerX - cardHalfW - m);
        spawnY = m + Math.random() * (canvas.height - m * 2);
      } else if (zone === 1 && canvas.width - m - (centerX + cardHalfW) > 40) {
        // Right flank
        spawnX = centerX + cardHalfW + Math.random() * (canvas.width - m - (centerX + cardHalfW));
        spawnY = m + Math.random() * (canvas.height - m * 2);
      } else if (zone === 2 && centerY - cardHalfH > m + 35) {
        // Top corridor
        spawnX = m + Math.random() * (canvas.width - m * 2);
        spawnY = m + Math.random() * (centerY - cardHalfH - m);
      } else if (zone === 3 && canvas.height - m - (centerY + cardHalfH) > 35) {
        // Bottom corridor
        spawnX = m + Math.random() * (canvas.width - m * 2);
        spawnY = centerY + cardHalfH + Math.random() * (canvas.height - m - (centerY + cardHalfH));
      } else {
        // Corners
        const corners = [
          { x: m + Math.random() * 120, y: m + Math.random() * 120 },
          { x: canvas.width - m - Math.random() * 120, y: m + Math.random() * 120 },
          { x: m + Math.random() * 120, y: canvas.height - m - Math.random() * 120 },
          { x: canvas.width - m - Math.random() * 120, y: canvas.height - m - Math.random() * 120 },
        ];
        const c = corners[idx % corners.length];
        spawnX = c.x;
        spawnY = c.y;
      }

      const initialTarget = getRandomKoiTarget(canvas.width, canvas.height);

      return {
        x: spawnX,
        y: spawnY,
        targetX: initialTarget.x,
        targetY: initialTarget.y,
        angle: Math.random() * Math.PI * 2,
        speed: (1.2 + Math.random() * 0.8) * speedMultiplier,
        length: 50 + Math.random() * 32, // varied sizes: younger agile koi to grand koi
        colorType,
        tailAngle: 0,
        finAngle: 0,
        phase: idx * 1.1,
        wiggleSpeed: 0.11 + Math.random() * 0.06,
        isJumping: false,
        jumpProgress: 0,
      };
    });

    // Initialize sparkling water highlights (sunlit crystal water effect)
    sparklesRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1.5 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03,
    }));

    // Initialize serene Water Lily Pads (Lá sen & Lá súng) around pond edges & corners
    lilyPadsRef.current = [
      // Top-Left Cluster (with blooming lotus flower)
      {
        relX: 0.07,
        relY: 0.12,
        radius: 46,
        rotation: 0.35,
        notchAngle: -0.55,
        colorStart: '#34d399',
        colorEnd: '#059669',
        hasFlower: true,
        flowerHue: '#f43f5e',
        dewDrops: [
          { dx: -12, dy: -9, r: 2.8 },
          { dx: 14, dy: 11, r: 2.2 },
          { dx: -5, dy: 15, r: 1.8 },
        ],
        phase: 0.2,
        tilt: 0,
      },
      {
        relX: 0.13,
        relY: 0.17,
        radius: 35,
        rotation: -0.7,
        notchAngle: 1.25,
        colorStart: '#6ee7b7',
        colorEnd: '#10b981',
        dewDrops: [
          { dx: 9, dy: -7, r: 2.4 },
          { dx: -8, dy: 9, r: 2.0 },
        ],
        phase: 1.5,
        tilt: 0,
      },
      {
        relX: 0.04,
        relY: 0.23,
        radius: 25,
        rotation: 1.5,
        notchAngle: -1.7,
        colorStart: '#10b981',
        colorEnd: '#047857',
        dewDrops: [{ dx: 5, dy: 5, r: 1.8 }],
        phase: 2.8,
        tilt: 0,
      },

      // Top-Right Cluster (with pastel pink water lily)
      {
        relX: 0.89,
        relY: 0.13,
        radius: 44,
        rotation: 2.1,
        notchAngle: 0.75,
        colorStart: '#34d399',
        colorEnd: '#059669',
        hasFlower: true,
        flowerHue: '#fb7185',
        dewDrops: [
          { dx: -11, dy: 9, r: 2.7 },
          { dx: 11, dy: -8, r: 2.2 },
        ],
        phase: 3.4,
        tilt: 0,
      },
      {
        relX: 0.95,
        relY: 0.21,
        radius: 32,
        rotation: -1.1,
        notchAngle: -0.4,
        colorStart: '#6ee7b7',
        colorEnd: '#10b981',
        dewDrops: [{ dx: 6, dy: 6, r: 2.0 }],
        phase: 4.1,
        tilt: 0,
      },

      // Bottom-Left Cluster
      {
        relX: 0.08,
        relY: 0.85,
        radius: 43,
        rotation: -0.25,
        notchAngle: 2.4,
        colorStart: '#34d399',
        colorEnd: '#059669',
        dewDrops: [
          { dx: -9, dy: -11, r: 2.6 },
          { dx: 11, dy: 7, r: 2.1 },
        ],
        phase: 1.1,
        tilt: 0,
      },
      {
        relX: 0.14,
        relY: 0.91,
        radius: 28,
        rotation: 1.05,
        notchAngle: -1.15,
        colorStart: '#6ee7b7',
        colorEnd: '#10b981',
        dewDrops: [{ dx: -5, dy: 5, r: 1.8 }],
        phase: 2.4,
        tilt: 0,
      },

      // Bottom-Right Cluster (with rose lily flower)
      {
        relX: 0.91,
        relY: 0.84,
        radius: 45,
        rotation: 1.85,
        notchAngle: -1.35,
        colorStart: '#34d399',
        colorEnd: '#059669',
        hasFlower: true,
        flowerHue: '#ec4899',
        dewDrops: [
          { dx: 12, dy: -9, r: 2.9 },
          { dx: -13, dy: 9, r: 2.3 },
        ],
        phase: 0.7,
        tilt: 0,
      },
      {
        relX: 0.85,
        relY: 0.90,
        radius: 34,
        rotation: -0.45,
        notchAngle: 0.85,
        colorStart: '#6ee7b7',
        colorEnd: '#10b981',
        dewDrops: [{ dx: 7, dy: -7, r: 2.0 }],
        phase: 3.8,
        tilt: 0,
      },
      {
        relX: 0.95,
        relY: 0.93,
        radius: 23,
        rotation: 0.65,
        notchAngle: 2.75,
        colorStart: '#10b981',
        colorEnd: '#047857',
        dewDrops: [{ dx: -4, dy: 4, r: 1.5 }],
        phase: 5.0,
        tilt: 0,
      },
    ];

    // Initialize 12 small floating green leaves drifting on water surface
    const leafColors = ['#15803d', '#16a34a', '#22c55e', '#65a30d', '#10b981'];
    leavesRef.current = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35 + 0.12,
      vy: (Math.random() - 0.5) * 0.25,
      length: 16 + Math.random() * 14,
      width: 7 + Math.random() * 5,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      phase: Math.random() * Math.PI * 2,
    }));

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Crystal-clear azure pond background wash
      const waterGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      waterGrad.addColorStop(0, 'rgba(224, 242, 254, 0.45)');
      waterGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.40)');
      waterGrad.addColorStop(1, 'rgba(125, 211, 252, 0.48)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pond tint layer
      ctx.fillStyle = pondColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Sparkling sunlight glimmers in clear water
      sparklesRef.current.forEach((sp) => {
        sp.phase += sp.speed;
        const alpha = Math.sin(sp.phase) * 0.4 + 0.4;
        if (alpha > 0.05) {
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
          ctx.fill();
        }
      });

      // 3. Draw Regular Food Pellets
      for (let i = foodRef.current.length - 1; i >= 0; i--) {
        const pellet = foodRef.current[i];
        pellet.life -= dt * 0.2;
        if (pellet.life <= 0) {
          foodRef.current.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(pellet.x, pellet.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${pellet.life})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pellet.x, pellet.y, (1 - pellet.life) * 18 + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14, 165, 233, ${pellet.life * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 4. Update & Draw Confetti (Falling & Floating on water for fish to eat)
      for (let i = confettiRef.current.length - 1; i >= 0; i--) {
        const c = confettiRef.current[i];
        c.rotation += c.vRot;

        if (!c.floating) {
          c.x += c.vx + Math.sin(c.y * 0.05) * 0.8;
          c.y += c.vy;

          if (c.y >= c.targetWaterY) {
            c.floating = true;
            // Splash ripple on water
            ripplesRef.current.push({
              x: c.x,
              y: c.y,
              radius: 2,
              maxRadius: 20,
              opacity: 0.6,
            });
          }
        } else {
          // Floating on water - gentle drift
          c.x += Math.cos(time * 0.002 + c.y) * 0.25;
          c.y += Math.sin(time * 0.002 + c.x) * 0.25;
          c.life -= dt * 0.04; // lasts nicely

          if (c.life <= 0) {
            confettiRef.current.splice(i, 1);
            continue;
          }
        }

        // Render confetti rectangle
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = c.floating ? Math.min(1, c.life * 1.5) : 0.9;
        ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
        ctx.restore();
      }

      // 5. Check random jumping koi ("màn hình cá coi nhảy")
      const now = Date.now();
      if (now - lastJumpTime.current > 3800 && Math.random() < 0.025) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const cardHalfW = Math.min(canvas.width * 0.44, 380);
        const cardHalfH = Math.min(canvas.height * 0.42, 320);

        // Prioritize jumping for fish in the visible outer corridors so the user can clearly see them!
        const visibleNonJumping = fishRef.current.filter(
          (f) =>
            !f.isJumping &&
            (Math.abs(f.x - centerX) > cardHalfW * 0.75 || Math.abs(f.y - centerY) > cardHalfH * 0.75)
        );
        const candidates = visibleNonJumping.length > 0 ? visibleNonJumping : fishRef.current.filter((f) => !f.isJumping);

        if (candidates.length > 0) {
          const luckyFish = candidates[Math.floor(Math.random() * candidates.length)];
          luckyFish.isJumping = true;
          luckyFish.jumpProgress = 0;
          lastJumpTime.current = now;

          // Splash at start of jump
          ripplesRef.current.push({
            x: luckyFish.x,
            y: luckyFish.y,
            radius: 8,
            maxRadius: 60,
            opacity: 0.9,
          });
          soundManager.playSplash();
        }
      }

      // 6. Update & Draw Red Koi Fish in Crystal Water
      fishRef.current.forEach((fish) => {
        fish.phase += fish.wiggleSpeed;

        // Handle Jump state
        if (fish.isJumping) {
          fish.jumpProgress = (fish.jumpProgress || 0) + dt * 1.1; // jump takes ~0.9s
          if (fish.jumpProgress >= 1) {
            fish.isJumping = false;
            fish.jumpProgress = 0;
            // Landing splash
            ripplesRef.current.push({
              x: fish.x,
              y: fish.y,
              radius: 10,
              maxRadius: 70,
              opacity: 0.95,
            });
            soundManager.playWaterDrop(400);
          }
        }

        // TARGETING LOGIC: Koi fish love to eat floating confetti & food pellets!
        let targetX = fish.targetX;
        let targetY = fish.targetY;
        let isChasingFood = false;

        // 1st priority: Floating confetti!
        const floatingConfetti = confettiRef.current.filter((c) => c.floating);
        if (floatingConfetti.length > 0) {
          let closestConfetti: ConfettiParticle | null = null;
          let minDist = 400;
          floatingConfetti.forEach((c) => {
            const dist = Math.hypot(c.x - fish.x, c.y - fish.y);
            if (dist < minDist) {
              minDist = dist;
              closestConfetti = c;
            }
          });

          if (closestConfetti) {
            targetX = (closestConfetti as ConfettiParticle).x;
            targetY = (closestConfetti as ConfettiParticle).y;
            isChasingFood = true;

            // If mouth touches confetti (head is len * 0.45 ahead)
            const headX = fish.x + Math.cos(fish.angle) * (fish.length * 0.45);
            const headY = fish.y + Math.sin(fish.angle) * (fish.length * 0.45);
            const mouthDist = Math.hypot((closestConfetti as ConfettiParticle).x - headX, (closestConfetti as ConfettiParticle).y - headY);

            if (mouthDist < 20) {
              // Koi eats the confetti!
              const idx = confettiRef.current.indexOf(closestConfetti);
              if (idx !== -1) {
                confettiRef.current.splice(idx, 1);
                setConfettiEatenCount((prev) => prev + 1);
                soundManager.playWaterDrop(520 + Math.random() * 220);

                // Small eating ripple
                ripplesRef.current.push({
                  x: headX,
                  y: headY,
                  radius: 3,
                  maxRadius: 35,
                  opacity: 0.85,
                });
              }
            }
          }
        }

        // 2nd priority: Normal food pellets
        if (!isChasingFood && foodRef.current.length > 0) {
          let closestFood: FoodPellet | null = null;
          let minDist = 450;
          foodRef.current.forEach((p) => {
            const dist = Math.hypot(p.x - fish.x, p.y - fish.y);
            if (dist < minDist) {
              minDist = dist;
              closestFood = p;
            }
          });

          if (closestFood) {
            targetX = (closestFood as FoodPellet).x;
            targetY = (closestFood as FoodPellet).y;
            isChasingFood = true;

            const headX = fish.x + Math.cos(fish.angle) * (fish.length * 0.45);
            const headY = fish.y + Math.sin(fish.angle) * (fish.length * 0.45);
            const mouthDist = Math.hypot((closestFood as FoodPellet).x - headX, (closestFood as FoodPellet).y - headY);

            if (mouthDist < 16) {
              const idx = foodRef.current.indexOf(closestFood);
              if (idx !== -1) {
                foodRef.current.splice(idx, 1);
                soundManager.playWaterDrop(620 + Math.random() * 150);
                ripplesRef.current.push({
                  x: headX,
                  y: headY,
                  radius: 4,
                  maxRadius: 35,
                  opacity: 0.8,
                });
              }
            }
          }
        }

        // Peaceful wandering with wide perimeter favoring visible edges & corridors
        if (!isChasingFood) {
          const distToTarget = Math.hypot(fish.targetX - fish.x, fish.targetY - fish.y);
          if (distToTarget < 90 || Math.random() < 0.007) {
            const nextTarget = getRandomKoiTarget(canvas.width, canvas.height);
            fish.targetX = nextTarget.x;
            fish.targetY = nextTarget.y;
            targetX = nextTarget.x;
            targetY = nextTarget.y;
          }

          // If fish is currently located directly underneath the central card,
          // nudge its target and course outward to emerge into open visible water!
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const cardHalfW = Math.min(canvas.width * 0.44, 380);
          const cardHalfH = Math.min(canvas.height * 0.42, 320);
          const dx = fish.x - centerX;
          const dy = fish.y - centerY;

          if (Math.abs(dx) < cardHalfW * 0.85 && Math.abs(dy) < cardHalfH * 0.85) {
            if (Math.abs(dx) / cardHalfW > Math.abs(dy) / cardHalfH) {
              targetX = dx > 0 ? (centerX + cardHalfW + 70) : (centerX - cardHalfW - 70);
            } else {
              targetY = dy > 0 ? (centerY + cardHalfH + 70) : (centerY - cardHalfH - 70);
            }
          }
        }

        // Smooth steering toward target
        const desiredAngle = Math.atan2(targetY - fish.y, targetX - fish.x);
        let angleDiff = desiredAngle - fish.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        fish.angle += angleDiff * (isChasingFood ? 0.065 : 0.038);

        // Soft edge deflection for wide swimming sweeps near screen borders
        const padEdge = 25;
        if (fish.x < padEdge && Math.cos(fish.angle) < 0) {
          fish.angle += 0.06;
        } else if (fish.x > canvas.width - padEdge && Math.cos(fish.angle) > 0) {
          fish.angle += 0.06;
        }
        if (fish.y < padEdge && Math.sin(fish.angle) < 0) {
          fish.angle += 0.06;
        } else if (fish.y > canvas.height - padEdge && Math.sin(fish.angle) > 0) {
          fish.angle += 0.06;
        }

        // Move forward
        const curSpeed = (fish.speed * (isChasingFood ? 1.6 : 1.0) * speedMultiplier);
        fish.x += Math.cos(fish.angle) * curSpeed;
        fish.y += Math.sin(fish.angle) * curSpeed;

        // Keep inside canvas bounds gracefully
        fish.x = Math.max(15, Math.min(canvas.width - 15, fish.x));
        fish.y = Math.max(15, Math.min(canvas.height - 15, fish.y));

        // Subtle swimming water ripples behind fish
        if (Math.random() < 0.045) {
          ripplesRef.current.push({
            x: fish.x - Math.cos(fish.angle) * (fish.length * 0.45),
            y: fish.y - Math.sin(fish.angle) * (fish.length * 0.45),
            radius: 3,
            maxRadius: 32,
            opacity: 0.4,
          });
        }

        // Draw Red Koi with jumping elevation if active
        drawVibrantRedKoi(ctx, fish);
      });

      // 7. Update & Draw Water Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        rip.radius += 1.3;
        rip.opacity -= 0.016;

        if (rip.opacity <= 0 || rip.radius >= rip.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${rip.opacity * 0.6})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius * 0.68, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${rip.opacity * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 8. Update & Draw Floating Leaves and Water Lily Pads on water surface (Lá sen & Lá súng bồng bềnh)
      drawFloatingLeaves(ctx, leavesRef.current, canvas.width, canvas.height, time);
      drawWaterLilyPads(ctx, lilyPadsRef.current, canvas.width, canvas.height, time);

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [speedMultiplier, pondColor]);

  // Click or tap to create ripple and feed Koi
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let clientX = 0;
    let clientY = 0;

    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ripplesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: 65,
      opacity: 0.95,
    });

    // Ripples gently tilt nearby lily pads
    lilyPadsRef.current.forEach((pad) => {
      const px = pad.relX * canvas.width;
      const py = pad.relY * canvas.height;
      const dist = Math.hypot(x - px, y - py);
      if (dist < 220) {
        pad.tilt = (Math.random() - 0.5) * 0.12;
      }
    });

    foodRef.current.push({
      x,
      y,
      life: 1.0,
    });

    setFoodCount((prev) => prev + 1);
    soundManager.playWaterDrop(540 + Math.random() * 200);

    if (onFeed) {
      onFeed();
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-hidden">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasInteraction}
        onTouchStart={handleCanvasInteraction}
        className="w-full h-full cursor-pointer block"
      />
      {interactive && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none opacity-80 hover:opacity-100 transition-opacity flex flex-col gap-1.5">
          <span className="text-xs text-slate-700 bg-white/80 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-sky-200/60 shadow-sm flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Nhấp hoặc chạm hồ để cho cá ăn 🎏 (Đã đớp {confettiEatenCount + foodCount} mẩu)
          </span>
        </div>
      )}
    </div>
  );
};

// Render vibrant red Koi fish swimming in clear blue water (supports jumping leap!)
function drawVibrantRedKoi(ctx: CanvasRenderingContext2D, fish: KoiFishData) {
  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.rotate(fish.angle);

  const len = fish.length;
  const bodyW = len * 0.29;

  // Check jump elevation
  const isJumping = fish.isJumping && fish.jumpProgress !== undefined;
  const jumpHeight = isJumping ? Math.sin((fish.jumpProgress || 0) * Math.PI) * 36 : 0;
  const jumpScale = isJumping ? 1 + Math.sin((fish.jumpProgress || 0) * Math.PI) * 0.18 : 1.0;

  // 1. Soft underwater shadow on the bed (stays on water surface while fish leaps above)
  ctx.save();
  ctx.translate(6, 10 + jumpHeight * 0.4);
  ctx.beginPath();
  ctx.ellipse(0, 0, len * 0.44, bodyW * 0.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(14, 116, 144, ${0.16 * (1 - jumpHeight / 70)})`;
  ctx.fill();
  ctx.restore();

  // Elevate fish body if jumping
  ctx.save();
  if (isJumping) {
    ctx.translate(0, -jumpHeight);
    ctx.scale(jumpScale, jumpScale);
  }

  // Wavy body curve points
  const wave = Math.sin(fish.phase) * (len * 0.15);
  const tailWave = Math.sin(fish.phase - 1.2) * (len * 0.28);

  // 2. Translucent Pectoral Fins (Left & Right)
  const finAngle = Math.sin(fish.phase * 0.8) * 0.25;

  // Left fin
  ctx.save();
  ctx.translate(len * 0.12, -bodyW * 0.7);
  ctx.rotate(-0.6 + finAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-len * 0.16, -len * 0.26, -len * 0.32, -len * 0.1);
  ctx.quadraticCurveTo(-len * 0.16, 0, 0, 0);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Right fin
  ctx.save();
  ctx.translate(len * 0.12, bodyW * 0.7);
  ctx.rotate(0.6 - finAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-len * 0.16, len * 0.26, -len * 0.32, len * 0.1);
  ctx.quadraticCurveTo(-len * 0.16, 0, 0, 0);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 3. Graceful Caudal / Tail Fin
  ctx.save();
  ctx.translate(-len * 0.45 + tailWave * 0.5, tailWave);
  ctx.rotate(tailWave * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-len * 0.36, -len * 0.3, -len * 0.42, 0);
  ctx.quadraticCurveTo(-len * 0.36, len * 0.3, 0, 0);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  // 4. Koi Main Torso (curved spine)
  ctx.beginPath();
  ctx.moveTo(len * 0.46, 0);
  ctx.bezierCurveTo(
    len * 0.3, -bodyW * 0.9,
    -len * 0.1 + wave * 0.2, -bodyW * 0.7 + wave * 0.3,
    -len * 0.45 + tailWave * 0.5, tailWave
  );
  ctx.bezierCurveTo(
    -len * 0.1 + wave * 0.2, bodyW * 0.7 + wave * 0.3,
    len * 0.3, bodyW * 0.9,
    len * 0.46, 0
  );
  ctx.closePath();

  // Base Porcelain Body Gradient
  const baseGrad = ctx.createLinearGradient(-len * 0.4, 0, len * 0.46, 0);
  baseGrad.addColorStop(0, '#f1f5f9');
  baseGrad.addColorStop(0.5, '#ffffff');
  baseGrad.addColorStop(1, '#fef2f2');
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // 5. Distinctive Vivid Red Koi Markings (Cá Koi Đỏ nổi bật trong nước xanh lam)
  ctx.save();
  ctx.clip(); // Clip pattern within fish body

  if (fish.colorType === 'crimson_red') {
    const redGrad = ctx.createLinearGradient(-len * 0.4, 0, len * 0.46, 0);
    redGrad.addColorStop(0, '#dc2626');
    redGrad.addColorStop(0.4, '#ef4444');
    redGrad.addColorStop(1, '#f87171');

    ctx.beginPath();
    ctx.ellipse(len * 0.05, wave * 0.15, len * 0.4, bodyW * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = redGrad;
    ctx.fill();
  } else if (fish.colorType === 'tancho_crown') {
    ctx.beginPath();
    ctx.arc(len * 0.25, 0, bodyW * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-len * 0.2, wave * 0.4, len * 0.12, bodyW * 0.4, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
  } else {
    // Kohaku Scarlet Patches
    ctx.beginPath();
    ctx.ellipse(len * 0.22, wave * 0.1, len * 0.16, bodyW * 0.65, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-len * 0.02, wave * 0.25, len * 0.18, bodyW * 0.72, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#ea580c';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-len * 0.26, wave * 0.5, len * 0.12, bodyW * 0.45, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
  }

  ctx.restore();

  // 6. Eyes
  ctx.beginPath();
  ctx.arc(len * 0.33, -bodyW * 0.52, 2.2, 0, Math.PI * 2);
  ctx.arc(len * 0.33, bodyW * 0.52, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(len * 0.34, -bodyW * 0.52 - 0.6, 0.8, 0, Math.PI * 2);
  ctx.arc(len * 0.34, bodyW * 0.52 - 0.6, 0.8, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Jump gleam sparkle
  if (isJumping && jumpHeight > 18) {
    ctx.beginPath();
    ctx.arc(len * 0.1, -bodyW * 0.3, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
  }

  ctx.restore();
  ctx.restore();
}

// Draw gentle green leaves drifting on the water surface (Lá cây trôi bồng bềnh)
function drawFloatingLeaves(
  ctx: CanvasRenderingContext2D,
  leaves: FloatingLeaf[],
  width: number,
  height: number,
  time: number
) {
  leaves.forEach((leaf) => {
    // Gentle drift and sway with water currents
    leaf.x += leaf.vx + Math.sin(time * 0.0015 + leaf.phase) * 0.25;
    leaf.y += leaf.vy + Math.cos(time * 0.0012 + leaf.phase) * 0.2;
    leaf.angle += leaf.rotSpeed;

    // Boundary wrap
    if (leaf.x > width + 40) leaf.x = -40;
    if (leaf.x < -40) leaf.x = width + 40;
    if (leaf.y > height + 40) leaf.y = -40;
    if (leaf.y < -40) leaf.y = height + 40;

    // 1. Soft underwater shadow on the pond bed
    ctx.save();
    ctx.translate(leaf.x + 3, leaf.y + 6);
    ctx.rotate(leaf.angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, leaf.length * 0.46, leaf.width * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 47, 73, 0.13)';
    ctx.fill();
    ctx.restore();

    // 2. Floating leaf blade
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.angle);

    ctx.beginPath();
    ctx.moveTo(-leaf.length * 0.5, 0);
    ctx.quadraticCurveTo(0, -leaf.width * 0.85, leaf.length * 0.5, 0);
    ctx.quadraticCurveTo(0, leaf.width * 0.85, -leaf.length * 0.5, 0);
    ctx.fillStyle = leaf.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Central leaf spine
    ctx.beginPath();
    ctx.moveTo(-leaf.length * 0.5, 0);
    ctx.lineTo(leaf.length * 0.48, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  });
}

// Draw serene Water Lily Pads with veins, dew drops & blooming flowers (Lá sen & Lá súng)
function drawWaterLilyPads(
  ctx: CanvasRenderingContext2D,
  pads: LilyPad[],
  width: number,
  height: number,
  time: number
) {
  pads.forEach((pad) => {
    // Tilt dampens smoothly after water disturbance
    pad.tilt *= 0.96;

    const driftX = Math.cos(time * 0.0012 + pad.phase) * 4.5;
    const driftY = Math.sin(time * 0.0016 + pad.phase) * 3.8;
    const cx = pad.relX * width + driftX;
    const cy = pad.relY * height + driftY;
    const curRot = pad.rotation + Math.sin(time * 0.0008 + pad.phase) * 0.04 + pad.tilt;

    // 1. Translucent aquatic shadow on the pond floor
    ctx.save();
    ctx.translate(cx + 6, cy + 9);
    ctx.rotate(curRot);
    ctx.beginPath();
    ctx.arc(0, 0, pad.radius * 0.96, pad.notchAngle + 0.32, pad.notchAngle + Math.PI * 2 - 0.32);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(8, 47, 73, 0.2)';
    ctx.fill();
    ctx.restore();

    // 2. Lily Pad disc with characteristic V-notch cleft
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(curRot);

    ctx.beginPath();
    ctx.arc(0, 0, pad.radius, pad.notchAngle + 0.3, pad.notchAngle + Math.PI * 2 - 0.3);
    ctx.lineTo(0, 0);
    ctx.closePath();

    const grad = ctx.createRadialGradient(0, 0, pad.radius * 0.08, 0, 0, pad.radius);
    grad.addColorStop(0, pad.colorStart);
    grad.addColorStop(0.72, pad.colorEnd);
    grad.addColorStop(1, '#064e3b');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(5, 150, 105, 0.55)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // 3. Delicate radiating leaf veins
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.32)';
    ctx.lineWidth = 1;
    for (let a = pad.notchAngle + 0.6; a < pad.notchAngle + Math.PI * 2 - 0.55; a += 0.65) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const midR = pad.radius * 0.52;
      const endR = pad.radius * 0.92;
      ctx.quadraticCurveTo(
        Math.cos(a + 0.1) * midR,
        Math.sin(a + 0.1) * midR,
        Math.cos(a) * endR,
        Math.sin(a) * endR
      );
      ctx.stroke();
    }

    // 4. Stalk center node
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. Glistening crystal water dew drops on leaf surface
    pad.dewDrops.forEach((drop) => {
      ctx.beginPath();
      ctx.arc(drop.dx, drop.dy, drop.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Specular sunlight gleam
      ctx.beginPath();
      ctx.arc(drop.dx - drop.r * 0.3, drop.dy - drop.r * 0.3, drop.r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();
    });

    // 6. Blooming water lily flower if present
    if (pad.hasFlower) {
      drawWaterLilyFlower(ctx, pad.flowerHue || '#f43f5e', pad.radius * 0.55);
    }

    ctx.restore();
  });
}

// Draw a blooming water lily / lotus blossom (Hoa sen / hoa súng hồng nhụy vàng)
function drawWaterLilyFlower(ctx: CanvasRenderingContext2D, petalHue: string, size: number) {
  ctx.save();
  ctx.translate(size * 0.3, -size * 0.2);

  // Outer petal ring (8 petals)
  const outerPetals = 8;
  for (let i = 0; i < outerPetals; i++) {
    const angle = (i * Math.PI * 2) / outerPetals;
    ctx.save();
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.35, -size * 0.35, size, 0);
    ctx.quadraticCurveTo(size * 0.35, size * 0.35, 0, 0);

    const grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#fbcfe8');
    grad.addColorStop(1, petalHue);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  // Inner petal ring (6 petals)
  const innerPetals = 6;
  const innerSize = size * 0.65;
  for (let i = 0; i < innerPetals; i++) {
    const angle = (i * Math.PI * 2) / innerPetals + Math.PI / innerPetals;
    ctx.save();
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(innerSize * 0.3, -innerSize * 0.3, innerSize, 0);
    ctx.quadraticCurveTo(innerSize * 0.3, innerSize * 0.3, 0, 0);

    const grad = ctx.createLinearGradient(0, 0, innerSize, 0);
    grad.addColorStop(0, '#fff1f2');
    grad.addColorStop(1, petalHue);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // Golden stamens center
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = '#fde047';
  ctx.fill();

  // Golden pollen stamen dots
  for (let j = 0; j < 6; j++) {
    const a = (j * Math.PI * 2) / 6;
    const px = Math.cos(a) * size * 0.22;
    const py = Math.sin(a) * size * 0.22;
    ctx.beginPath();
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#d97706';
    ctx.fill();
  }

  ctx.restore();
}
