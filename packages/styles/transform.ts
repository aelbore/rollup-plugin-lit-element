import { createRequire } from 'module'
import { extname } from 'path'

import type { Options, CompileResult, StringOptions } from 'sass'

export interface Sass {
  compile(path: string, options?: Options<'sync'>): CompileResult
  compileString(source: string, options?: StringOptions<'sync'>): CompileResult;
}

const createImportModule = <T extends Sass>(path: string) => {
  try { return require(path) as T } 
  catch { return createRequire(import.meta.url)(path) as T }
}

const escape = (str: string): string => str
  .replace(/`/g, '\\`')
  .replace(/\\(?!`)/g, '\\\\')

export function transform(code: string, id: string, options?: Options<'sync'>) {
  const css = extname(id).includes('.scss') ? createImportModule('sass').compile(id, options).css: code
  return { 
    code: `export default '${escape(css).replace(/\r?\n|\r/g, '')}';`, 
    map: { mappings: '' } 
  } as import('rollup').SourceDescription
}