import type { 
  Module, 
  Program, 
  ModuleItem, 
  ImportDefaultSpecifier, 
  ArrayExpression, 
  Identifier, 
  ClassProperty,
  ClassMember,
  ClassDeclaration
} from '@swc/core'

import { Visitor } from '@swc/core/Visitor.js'
import * as swc from 'swc-ast-helpers'

import { getClassDeclaration, getStyleImportDefaultDeclarations } from '@/shared'

const filterStaticStyles = (content: ClassDeclaration) => content.body.filter(item => (!isStyleStaticClassProperty(item)))

const isStylesExpressionStatement = (item: ModuleItem) => {
  return swc.isExpressionStatement(item)
    && swc.isAssignmentExpression(item.expression)
    && swc.isMemberExpression(item.expression.left)
    && swc.isIdentifer(item.expression.left.property)
    && item.expression.left.property.value.includes('styles')
}

const isStyleStaticClassProperty = (item: ClassMember) => {
  return swc.isClassProperty(item) 
    && swc.isIdentifer(item.key)
    && item.key.value.includes('styles')
}

const updateClassDeclaration = (items: ModuleItem[], styles: ImportDefaultSpecifier[], property?: ClassProperty) => {
  const styleProperty = createStaticStyleProperty(styles, property)
  return items.filter(content => (!isStylesExpressionStatement(content)))
    .map(content => {
      if (swc.isExportDeclaration(content) && swc.isClasDeclaration(content.declaration)) {
        content.declaration.body = filterStaticStyles(content.declaration)
        content.declaration.body.push(styleProperty)
      }
      if (swc.isClasDeclaration(content)) {
        content.body = filterStaticStyles(content)
        content.body.push(styleProperty)
      }
      return content
    })
}

const createStaticStyleProperty = (styles: ImportDefaultSpecifier[], property: ClassProperty) => {
  const propertyValue = (property?.value || {}) as ArrayExpression
  const elements = propertyValue.elements?.map(element => ((element.expression) as Identifier).value) || []

  const toAddStyles = styles.reduce((p, c) => {
    if (!elements.includes(c.local.value)) p.push(c.local)
    return p
  }, [] as Identifier[])
  .map(style => ({ expression: style }))

  return swc.createClassProperty(
      'styles', 
      swc.createArrayExpression([ ...(propertyValue.elements || []), ...toAddStyles ]),
      { isStatic: true }
  )
}

class StyleClassStatement extends Visitor {
  visitModule(e: Module) {
    const moduleItem = getClassDeclaration(e.body)
    const styles = getStyleImportDefaultDeclarations(e.body)
  
    if (moduleItem && styles.length > 0) {
      const styleProperty = moduleItem.body.find(item => isStyleStaticClassProperty(item)) as ClassProperty
      const contents = updateClassDeclaration(e.body, styles, styleProperty)
  
      e.body = contents
    }

    return e
  }
}

export function createStyleClassStatement() {
  return (program: Program) => new StyleClassStatement().visitProgram(program)
}