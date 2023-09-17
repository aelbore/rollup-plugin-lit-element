import { transformSync, plugins as Plugins, Plugin } from '@swc/core'

export interface SwcOptions {
  plugins?: Plugin[]
  paths?: {
    [from: string]: [string];
  }
  baseUrl?: string
}

export const swcTransformer = (
  code: string,
  id: string,
  options?: SwcOptions
) => {
  const { paths, plugins, baseUrl } = options || {}
  return transformSync(code, {
    jsc: {
      parser: {
        syntax: 'typescript',
        decorators: true,
        dynamicImport: true,
        tsx: true
      },
      target: 'es2022',
      ...(baseUrl ? { baseUrl }: {}),
      ...(paths ? { paths  }: {})
    },
    filename: id,
    sourceMaps: true,
    isModule: true,
    plugin: Plugins(plugins || [])
  })
}