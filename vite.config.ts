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

        let inlineCss = cssFiles
          .map((f) => fs.readFileSync(path.join(assetsDir, f), 'utf-8'))
          .join('\n');

        const fontsDir = path.join(distDir, 'fonts');
        if (fs.existsSync(fontsDir)) {
          inlineCss = inlineCss.replace(/url\((?:['"]?)\/fonts\/([^)'"]+)(?:['"]?)\)/g, (match, fileName) => {
            const fontFile = path.join(fontsDir, fileName);
            if (fs.existsSync(fontFile)) {
              const b64 = fs.readFileSync(fontFile).toString('base64');
              return `url("data:font/woff2;base64,${b64}")`;
            }
            return match;
          });
          fs.rmSync(fontsDir, {recursive: true, force: true});
        }

        const assetsInDist = path.join(distDir, 'assets');
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

        fs.rmSync(assetsInDist, {recursive: true, force: true});
      }

      const extraPublicAssets = path.join(distDir, 'assets');
      if (fs.existsSync(extraPublicAssets)) {
        fs.rmSync(extraPublicAssets, {recursive: true, force: true});
      }

      const outPath = path.join(distDir, 'StructTutor.html');
      fs.writeFileSync(outPath, html, 'utf-8');
      fs.writeFileSync(indexHtmlPath, html, 'utf-8');
    },
  };
}

export default defineConfig(() => {
  const pkgPath = path.resolve(import.meta.dirname, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { version?: string };
  const buildDate = new Date().toISOString().slice(0, 10);
  const isWebSplit = process.env.BUILD_WEB_SPLIT === 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isWebSplit ? [] : [singleFileHtmlPlugin()]),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version ?? '0.2.0'),
      __APP_BUILD_DATE__: JSON.stringify(buildDate),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: isWebSplit ? 1000 : 3500,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
