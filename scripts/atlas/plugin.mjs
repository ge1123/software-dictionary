import { renderAtlas } from './render.mjs';

export function atlasPlugin() {
  let cache;
  return {
    name: 'schema-model-atlas',
    async generateBundle() {
      for (const [fileName,source] of await renderAtlas()) this.emitFile({type:'asset',fileName,source});
    },
    configureServer(server) {
      server.watcher.on('change', path => {
        if (path.includes('/src/model-atlas/')) cache=undefined;
      });
      server.middlewares.use(async (req,res,next) => {
        const path = (req.url ?? '').split('?')[0].replace(/^\//,'');
        if (!path.startsWith('models/') || path.endsWith('.css')) return next();
        try {
          cache ??= renderAtlas();
          const html = (await cache).get(path.endsWith('/') ? path+'index.html' : path);
          if (!html) return next();
          res.setHeader('Content-Type','text/html; charset=utf-8');
          res.end(html);
        } catch (error) { next(error); }
      });
    }
  };
}
