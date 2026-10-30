import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function singleFileHtmlPlugin(): Plugin {
  return {
    name: 'structtutor-single-file-html',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, 'dist');
      const indexHtmlPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexHtmlPath)) {
        return;
      }

      let html = fs.readFileSync(indexHtmlPath, 'utf-8');
      const assetsDir = path.join(distDir, 'assets');

      if (fs.existsSync(assetsDir)) {
        const assetFiles = fs.readdirSync(assetsDir);
        const cssFiles = assetFiles.filter((f) => f.endsWith('.css'));
        const jsFiles = assetFiles.filter((f) => f.endsWith('.js'));

        const inlineCss = cssFiles
          .map((f) => fs.readFileSync(path.join(assetsDir, f), 'utf-8'))
          .join('\n');
        const inlineJs = jsFiles
          .map((f) => fs.readFileSync(path.join(assetsDir, f), 'utf-8'))
          .join('\n')
          .replace(/<\/script>/gi, () => '<\\/script>');

        html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, () => '');
        html = html.replace(/<script[^>]*type="module"[^>]*><\/script>/gi, () => '');

        if (inlineCss) {
          html = html.replace('</head>', () => `<style>\n${inlineCss}\n</style>\n</head>`);
        }
        if (inlineJs) {
          html = html.replace(
            '</body>',
            () => `<script>\n(function(){\n${inlineJs}\n})();\n</script>\n</body>`
          );
        }

        fs.rmSync(assetsDir, {recursive: true, force: true});
      }

      const outPath = path.join(distDir, 'StructTutor.html');
      fs.writeFileSync(outPath, html, 'utf-8');
      fs.rmSync(indexHtmlPath, {force: true});
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), singleFileHtmlPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
