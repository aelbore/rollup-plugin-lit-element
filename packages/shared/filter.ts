import { createFilter } from '@rollup/pluginutils'

export const cssfilter = createFilter('**/*.{css,scss,css?inline,scss?inline}')
export const tsJsFilter = createFilter('**/*.{js,ts,mjs}')