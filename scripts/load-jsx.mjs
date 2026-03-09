import { build } from 'esbuild';

const cache = new Map();

export async function importJsxModule(relativePath) {
  const entryPoint = new URL(relativePath, import.meta.url);
  const cacheKey = entryPoint.href;

  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, (async () => {
      const result = await build({
        entryPoints: [entryPoint.pathname],
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'node24',
        write: false,
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        loader: { '.jsx': 'jsx' },
        logLevel: 'silent',
      });

      const code = result.outputFiles[0].text;
      const source = Buffer.from(code).toString('base64');
      return import(`data:text/javascript;base64,${source}`);
    })());
  }

  return cache.get(cacheKey);
}
