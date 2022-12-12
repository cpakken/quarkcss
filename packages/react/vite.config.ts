import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import packagejson from './package.json'

const external = [packagejson.peerDependencies, packagejson.dependencies].flatMap(Object.keys)

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs', 'es'],
      name: 'index',
      fileName: 'index',
    },
    rollupOptions: {
      external,
    },
  },

  plugins: [
    dts({
      outputDir: 'dist/types',
      exclude: ['**/vite-env.d.ts'],
    }),
  ],
})
