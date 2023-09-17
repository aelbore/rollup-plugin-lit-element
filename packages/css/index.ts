import type { InputPlugin, Options, ViteInject } from '../shared'

import { InlineTransformer, Transformer } from './transformer'
import { swcTransformer, filter  } from '../shared'

export * from './transformer'
export function InlineCss(options?: Options) {
  const { vite, enforce = 'post' } = options || {}
  const isViteInject = (vite as ViteInject)?.inject
  return {
    name: 'css',
    enforce,
    transform(code: string, id: string) {
      const tsJsFilter = filter('js', options?.exclude || [])
      if (!tsJsFilter(id)  || (typeof vite == 'boolean' && vite) || isViteInject) return
      return swcTransformer(code, id, {
        paths: options?.paths,
        baseUrl: options?.baseUrl,
        plugins: [ (p) => new InlineTransformer().visitProgram(p) ]
      })
    }
  } as InputPlugin
}

export function Css(options?: Options) {
  const { vite, enforce = 'post', exclude } = options || {}
  return {
    name: 'css',
    enforce,
    transform(code: string, id: string) {
      const cssfilter = filter('css', exclude || [])
      if (!cssfilter(id.split('?')[0]) || !vite) return
      return swcTransformer(code, id, {
        paths: options?.paths,
        baseUrl: options.baseUrl,
        plugins: [ (p) => new Transformer(options).visitProgram(p) ]
      })
    }
  } as InputPlugin
}