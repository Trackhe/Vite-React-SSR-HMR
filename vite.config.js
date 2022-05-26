import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export const paths = {
  template: path.resolve(__dirname, '.', 'index.html'),
  server: path.resolve(__dirname, '.', 'server/src/index.jsx'),
  clientoutput: path.resolve(__dirname, '.', 'build/client'),
  serverOutput: path.resolve(__dirname, '.', 'build/server'),
  public: path.resolve(__dirname, '.', 'build/public'),
};

const SSR = () => ({
  name: 'ssr',
  configureServer(vite) {
    const { logger } = vite.config;
    const templateHtml = fs.readFileSync(paths.template, 'utf-8');
    console.log(templateHtml)
    return () => vite.middlewares.use(async (req, res, next) => {
      //try {
        const { render } = await vite.ssrLoadModule(paths.serverEntry);
        const template = await vite.transformIndexHtml(req.originalUrl, templateHtml);
        const { html } = await render({ req, res, template });

        res.end(html);
      //} catch (e) {
      //  console.log("hiho")
      //  vite.ssrFixStacktrace(e);
      //  logger.error(e.stack ?? e.message);
      //  next();
      //}
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    build: {
      sourcemap: true,
      emptyOutDir: false,
      outDir: 'build/app',
    },
    resolve: {
      alias: {
        '@': paths.src,
      },
    },
    plugins: [
      react(),
      SSR()
    ]
  }
})