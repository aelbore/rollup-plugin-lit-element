export type Enforce = 'pre' | 'post'
export type ViteInject = { inject?: boolean }
export type Vite = ViteInject | boolean

export interface Options {
  vite?: Vite
  enforce?: Enforce
  importPackage?: string
  paths?: {
    [from: string]: [string];
  }
}