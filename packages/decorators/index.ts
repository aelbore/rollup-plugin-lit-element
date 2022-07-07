import type { Plugin } from 'rollup'
import type { Enforce, Options } from 'shared'

import { swcTransformer, tsJsFilter } from 'shared'

import { customElementTransformer } from './custom-element'
import { inlinePropertyTransformer } from './property'
import { queryTransformer } from './query'

export default function decorators(options: Options = {}) {
  return {
    name: 'decorators',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (tsJsFilter(id)) {
        return swcTransformer(code, id, {
          paths: options.paths,
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