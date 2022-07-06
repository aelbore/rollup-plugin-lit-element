import { createFilter } from '@rollup/pluginutils'

const exclude = [ /node_modules/, /virtual/ ]

export const cssfilter = createFilter('**/*.{css,scss,css?inline,scss?inline}', exclude)
export const tsJsFilter = createFilter('**/*.{js,ts,tsx,jsx,mjs}', exclude)