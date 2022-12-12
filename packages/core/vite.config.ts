import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs', 'es'],
      name: 'index',
      fileName: 'index',
    },
  },
  plugins: [
    dts({
      outputDir: 'dist/types',
      exclude: ['**/vite-env.d.ts'],
    }),
  ],
})
