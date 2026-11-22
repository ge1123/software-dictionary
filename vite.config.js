import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';

const cases = readdirSync('cases', { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => `cases/${entry.name}/index.html`);

export default defineConfig({
  build: { rollupOptions: { input: ['index.html', ...cases] } }
});
