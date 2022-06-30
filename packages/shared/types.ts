export type Enfore = 'pre' | 'post'
export type ViteInject = { inject?: boolean }
export type Vite = ViteInject | boolean

export interface Options {
  vite?: Vite
  enforce?: Enfore
  importPackage?: string
  paths?: {
    [from: string]: [string];
  }
}