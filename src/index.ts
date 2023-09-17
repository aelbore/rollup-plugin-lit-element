import { createRequire } from 'module'
import { existsSync } from 'fs'
import { resolve } from 'path'

import { InlineCss, Css } from '../packages/css/index'
import Decorators, { customElementTransformer, queryTransformer, inlinePropertyTransformer } from '../packages/decorators/index'
import { styles as Styles } from '../packages/styles/index'

import type { Options, InputPlugin, TSConfig } from '../packages/shared/types'

export { swcTransformer, filter } from '../packages/shared/index'
export { transform as transformCss  } from '../packages/styles/transform'
export { rewriteImportStyles, createStyleClassStatement } from '../packages/styles/index'
export { Decorators, customElementTransformer, queryTransformer, inlinePropertyTransformer }
export { Styles, InlineCss }

const Plugins = (style: boolean, css: boolean, options?: Options) => {
  const { overridePaths = false, exclude = [], paths: tsPaths, baseUrl } = options || {}
  const paths = overridePaths ? tsPaths ?? getTsConfigPaths(): getTsConfigPaths()
  return [
    Decorators({ paths, exclude, baseUrl }),
    Styles({ paths, exclude, vite: style, baseUrl }),
    InlineCss({ paths, exclude, vite: { inject: css }, baseUrl }),
    Css({ paths, exclude, vite: { inject: css }, baseUrl })
  ] as InputPlugin[]
}

export const getTsConfigPaths = () => {
  const requireModule = <T extends TSConfig>(path: string) => {
    try { return require(path) as T }
    catch { return createRequire(import.meta.url)(path) as T }
  }
  const tsConfigPath = resolve('tsconfig.json')
  return existsSync(tsConfigPath) ? requireModule(tsConfigPath).compilerOptions?.paths: undefined
}

export const ViteLit = (options?: Pick<Options, 'overridePaths' | 'paths' | 'exclude' | 'baseUrl'>) => Plugins(true, false, options)
export const Lit = (options?: Pick<Options, 'overridePaths' | 'paths' | 'exclude' | 'baseUrl'>) => Plugins(false, true, options)