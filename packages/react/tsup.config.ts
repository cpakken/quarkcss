import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  // format: ['cjs', 'esm'],
  // minify: true,
  // sourcemap: true,
  dts: true,
  clean: true,
})
