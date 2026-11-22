import { defineConfig } from 'vite';
import { guides } from './src/guides.js';
import { atlasPlugin } from './scripts/atlas/plugin.mjs';
import { readdirSync } from 'node:fs';

const cases = readdirSync('cases', { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => `cases/${entry.name}/index.html`);

export default defineConfig({
  plugins: [atlasPlugin()],
  build: { rollupOptions: { input: ['index.html', ...cases, ...guides.map(g => 'guides/' + g.id + '/index.html')] } }
});
