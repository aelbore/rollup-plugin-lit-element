import { createRequire } from 'module'
import { existsSync } from 'fs'
import { resolve } from 'path'

import { InlineCss, Css } from '../packages/css/index'
import { styles as Styles } from '../packages/styles/index'
import Decorators from 'decorators'

import type { Plugin } from 'vite'
import type { Options, TSConfig } from '../packages/shared/types'

export { swcTransformer, filter } from '../packages/shared/index'
export { transform as transformCss  } from '../packages/styles/transform'
export { Styles, InlineCss }

const Plugins = (style: boolean, css: boolean, options?: Options) => {
  const { overridePaths = false, exclude = [], paths: tsPaths } = options || {}
  const paths = overridePaths ? tsPaths ?? getTsConfigPaths(): getTsConfigPaths() 
  return [ 
    Decorators({ paths, exclude }),
    Styles({ paths, exclude, vite: style }),  
    InlineCss({ paths, exclude, vite: { inject: css } }),
    Css({ paths, exclude, vite: { inject: css } }) 
  ] as Plugin[]
}

export const getTsConfigPaths = () => {
  const requireModule = <T extends TSConfig>(path: string) => {
    try { return require(path) as T }
    catch { return createRequire(import.meta.url)(path) as T }
  }
  const tsConfigPath = resolve('tsconfig.json')
  return existsSync(tsConfigPath) ? requireModule(tsConfigPath).compilerOptions?.paths: undefined
}

export const ViteLit = (options?: Pick<Options, 'overridePaths' | 'paths' | 'exclude'>) => Plugins(true, false, options)
export const Lit = (options?: Pick<Options, 'overridePaths' | 'paths' | 'exclude'>) => Plugins(false, true, options)