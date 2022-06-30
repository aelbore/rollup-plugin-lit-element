import type { Plugin } from 'rollup'
import type { Enfore, Options } from '@/shared'

import { swcTransformer, tsJsFilter, cssfilter } from '@/shared'

import { rewriteImportStyles } from './rewrite'
import { createStyleClassStatement } from './statement'
import { transform } from './transform'

export default function styles(options: Options = {}) {
  const vite = (typeof options.vite == 'boolean') ? options.vite: true
  return {
    name: 'styles',
    enfore: 'pre',
    transform(code: string, id: string) {
      if (tsJsFilter(id)) {
        return swcTransformer(code, id, {
          paths: options.paths,
          plugins: [ rewriteImportStyles(), createStyleClassStatement() ]
        })
      }
      if (cssfilter(id) && (!vite)) {
        return transform(code, id)
      }
      return null
    }
  } as Plugin & { enfore?: Enfore }
}