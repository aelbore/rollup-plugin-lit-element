import type { Plugin } from 'rollup'
import type { Enforce } from 'shared'

import { swcTransformer, tsJsFilter } from 'shared'

import { customElementTransformer } from './custom-element'
import { inlinePropertyTransformer } from './property'
import { queryTransformer } from './query'

export default function decorators() {
  return {
    name: 'decorators',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (tsJsFilter(id)) {
        return swcTransformer(code, id, {
          plugins: [ 
            customElementTransformer(), 
            inlinePropertyTransformer(),
            queryTransformer()
          ]
        })
      }
      return null
    }
  } as Plugin & { enforce?: Enforce }
}