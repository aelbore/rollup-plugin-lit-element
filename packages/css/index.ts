import type { Plugin } from 'rollup'
import type { Program } from '@swc/core'
import type { Enfore, Options, ViteInject } from '@/shared'

import { InlineTransformer, Transformer } from './transformer'
import { swcTransformer,  cssfilter, tsJsFilter  } from '@/shared'
 
export default function css(options?: Options) {
  const { vite, enforce = 'post' } = options || {}
  const isViteInject = (vite as ViteInject)?.inject

  const inline = () => (p: Program) => new InlineTransformer().visitProgram(p)
  const style = () => (p: Program) => new Transformer(options).visitProgram(p)

  return {
    name: 'css',
    enforce,
    transform(code: string, id: string) {
      const isTsFile = tsJsFilter(id), isCssFile = cssfilter(id)

      if (isTsFile && ((typeof vite == 'boolean' && vite) || isViteInject)) return null
      if (isCssFile && !vite) return null

      return swcTransformer(code, id, {
        paths: options?.paths,
        plugins: [       
          ...((isTsFile && (!isViteInject)) ? [ inline() ]: []),
          ...(isCssFile ? [ style()  ]: []) 
        ]
      })
    }
  } as Plugin & { enforce?: Enfore }
} 