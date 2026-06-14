import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/merge.ts'],
  format: ['esm'],
  fixedExtension: false,
  // format: ['cjs', 'esm'],
  // minify: true,
  // sourcemap: true,
  dts: true,
  clean: true,
})
