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
  paths?: {
    [from: string]: [string]
  }
}