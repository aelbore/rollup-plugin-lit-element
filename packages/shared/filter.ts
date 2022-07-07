import { createFilter } from '@rollup/pluginutils'

const excludes = [ /node_modules/, /virtual/ ]

export const cssfilter = createFilter('**/*.{css,scss,css?inline,scss?inline}', excludes)
export const tsJsFilter = createFilter('**/*.{js,ts,tsx,jsx,mjs}', excludes)

export type FilterType = 'js' | 'css'

export const filter = (type: FilterType, exclude: string | string[]) => {
  const fileExcludes = [ ...excludes, ...Array.isArray(exclude) ? exclude: [ exclude ] ]
  return (type === 'css') 
    ? createFilter('**/*.{css,scss,css?inline,scss?inline}', fileExcludes)
    : createFilter('**/*.{js,ts,tsx,jsx,mjs}', fileExcludes)
}