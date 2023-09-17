import type { InputPlugin, Options } from '../shared/index'

import { swcTransformer, tsJsFilter } from '../shared/index'

import { customElementTransformer } from './custom-element'
import { inlinePropertyTransformer } from './property'
import { queryTransformer } from './query'

export { customElementTransformer, inlinePropertyTransformer, queryTransformer }

export default function decorators(options: Options = {}) {
  return {
    name: 'decorators',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (tsJsFilter(id)) {
        return swcTransformer(code, id, {
          paths: options.paths,
          baseUrl: options.baseUrl,
          plugins: [
            customElementTransformer(),
            inlinePropertyTransformer(),
            queryTransformer()
          ]
        })
      }
      return null
    }
  } as InputPlugin
}