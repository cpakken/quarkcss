import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],

  // minifyWhitespace: false,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,

  sourcemap: true,
  dts: true,
  clean: true,
})
