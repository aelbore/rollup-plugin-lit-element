import * as swc from 'swc-ast-helpers'

import type { 
  ModuleItem, 
  ExportDeclaration, 
  ImportDefaultSpecifier, 
  ImportDeclaration, 
  ClassDeclaration, 
  Decorator, 
  ClassMember 
} from '@swc/core'

export function hasDecorator(decorator: Decorator, text: string){
  return swc.isDecorator(decorator) 
    && swc.isCallExpression(decorator.expression)
    && swc.isIdentifer(decorator.expression.callee)
    && decorator.expression.callee.value.includes(text)
}

export function updateMemberDecorators(members: ClassMember[], decorators: string[]) {
  return members.map(member => {
    if (swc.isClassProperty(member) && member.decorators) {
      member.decorators = member.decorators.filter(decorator => {
        return swc.isCallExpression(decorator.expression) 
          && swc.isIdentifer(decorator.expression.callee)
          && (!(decorators.includes(decorator.expression.callee.value)))
      })
    }
    return member
  })
}

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