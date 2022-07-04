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
  const { paths, plugins } = options || {}
  return transformSync(code, {
    jsc: {
      parser: { 
        syntax: 'typescript', 
        decorators: true, 
        dynamicImport: true 
      },
      target: 'es2022',
      ...(paths ? { paths  }: {})
    },
    filename: id,
    sourceMaps: true,
    isModule: true,
    plugin: Plugins(plugins || [])
  })
}