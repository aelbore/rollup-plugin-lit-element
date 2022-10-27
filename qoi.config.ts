import { existsSync } from 'fs'
import { rename, rm } from 'fs/promises'
import { defineConfig } from 'qoi-cli'

import { compilerOptions } from './tsconfig.json'
 
export default defineConfig({
  swc: {
    jsc: {
      target: 'es2022',
      paths: compilerOptions.paths
    }
  },
  async buildEnd() {
    const outDir = './node_modules/rollup-plugin-lit-element'
    existsSync(outDir) && await rm(outDir, { recursive: true }) 
    await rename('./dist', outDir)
  }
})