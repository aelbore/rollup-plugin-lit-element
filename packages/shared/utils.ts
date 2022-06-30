import type { ModuleItem, ExportDeclaration, ImportDefaultSpecifier, ImportDeclaration, ClassDeclaration } from '@swc/core'
import * as swc from 'swc-ast-helpers'

export function getClassDeclaration(items: ModuleItem[]) {
  const exportDeclaration = items.find(content => swc.isExportDeclaration(content) && swc.isClasDeclaration(content.declaration))
  return (
    exportDeclaration
      ? (exportDeclaration as ExportDeclaration).declaration
      : items.find(content => swc.isClasDeclaration(content))
  ) as ClassDeclaration
}

export function hasImportDefaultSpecifierStyle(item: ModuleItem) {
  return (swc.isImportDeclaration(item) 
    && (item.specifiers.length > 0) 
    && (item.source.value.includes('.css') || item.source.value.includes('.scss')))
}

export function getStyleImportDefaultDeclarations(items: ModuleItem[]) {
  return items.reduce((p: ImportDefaultSpecifier[], c) => {
    if (hasImportDefaultSpecifierStyle(c)) {
      const specifiers = (c as ImportDeclaration).specifiers.filter(s => {
        return swc.isImportDefaultSpecifier(s)
      }) as ImportDefaultSpecifier[]
      p = [ ...p, ...specifiers ]
    }
    return p
  }, [] as ImportDefaultSpecifier[])
}