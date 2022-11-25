export type { InputPlugin } from 'qoi-cli'

export type Enforce = 'pre' | 'post'
export type ViteInject = { inject?: boolean }
export type Vite = ViteInject | boolean

export type TSConfig = { 
  overridePaths?: boolean
  compilerOptions?: { paths?: { [from: string]: [string] }  } 
}

export interface Options {
  vite?: Vite
  enforce?: Enforce
  importPackage?: string
  overridePaths?: boolean
  exclude?: string | string[]
  minify?: boolean
  sassOptions?: import('sass').Options<'sync'>
  paths?: {
    [from: string]: [string]
  }
}