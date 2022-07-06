import { createRequire } from 'module'
import { existsSync } from 'fs'
import { resolve } from 'path'

import { InlineCss, Css } from 'css'
import Styles from 'styles'
import Decorators from 'decorators'

import type { Plugin } from 'vite'

type TSConfig = { 
  compilerOptions?: { paths?: { [from: string]: [string] }  } 
}

const getPaths = () => {
  const requireModule = <T extends TSConfig>(path: string) => {
    try { return require(path) as T }
    catch { return createRequire(import.meta.url)(path) as T }
  }
  const tsConfigPath = resolve('tsconfig.json')
  return existsSync(tsConfigPath) ? requireModule(tsConfigPath).compilerOptions?.paths: undefined
}

const Plugins = (style: boolean, css: boolean) => {
  const paths = getPaths()
  return [ 
    Decorators(), 
    Styles({ paths, vite: style }),  
    InlineCss({ paths, vite: { inject: css } }),
    Css({ paths, vite: { inject: css } }) 
  ] as Plugin[]
}

export const ViteLit = () => Plugins(true, false)
export const Lit = () => Plugins(false, true)