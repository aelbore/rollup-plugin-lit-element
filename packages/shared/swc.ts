import { transformSync, plugins as Plugins, Plugin } from '@swc/core'

export interface SwcOptions {
  plugins?: Plugin[]
  paths?: {
    [from: string]: [string];
  }
}

export const swcTransformer = (
  code: string, 
  id: string, 
  options?: SwcOptions
) => {
  return transformSync(code, {
    jsc: {
      parser: { syntax: 'typescript' },
      target: 'es2022',
      ...(options?.paths ? { paths: options?.paths  }: {})
    },
    filename: id,
    sourceMaps: true,
    isModule: true,
    plugin: Plugins(options.plugins || [])
  })
}