import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'save-config-plugin',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.method === 'POST' && req.url === '/api/save-config') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  const giftsDir = path.resolve(__dirname, 'public/gifts');
                  if (!fs.existsSync(giftsDir)) {
                    fs.mkdirSync(giftsDir, { recursive: true });
                  }
                  if (data.gifts && Array.isArray(data.gifts)) {
                    data.gifts.forEach((g: any, idx: number) => {
                      if (g.imageUrl && g.imageUrl.startsWith('data:image/')) {
                        const matches = g.imageUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
                        if (matches) {
                          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                          const filename = `gift-${idx + 1}.${ext}`;
                          fs.writeFileSync(path.resolve(giftsDir, filename), Buffer.from(matches[2], 'base64'));
                          g.imageUrl = `/gifts/${filename}`;
                        }
                      }
                    });
                  }
                  const configPath = path.resolve(__dirname, 'src/data/savedConfig.json');
                  fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8');
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ ok: true, message: 'Saved to savedConfig.json successfully' }));
                } catch (err: any) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ ok: false, error: err?.message }));
                }
              });
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
