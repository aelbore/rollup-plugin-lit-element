
import { Visitor } from '@swc/core/Visitor.js'
import { getClassDeclaration, hasDecorator } from 'shared'

import * as swc from 'swc-ast-helpers'

import type { Module, Decorator, Program, CallExpression, StringLiteral, ModuleItem, Argument, Identifier } from '@swc/core'

const customElementStatement = (tag: StringLiteral, element: string) => {
  return swc.createExpressionStatement(
    swc.createCallExpression(
      swc.createMemberExpression(swc.createIdentifer('customElements'), swc.createIdentifer('define')),
      [
        { expression: tag },
        { expression: swc.createIdentifer(element) }
      ]
    ))
}

const filterDecorators = (decorators: Decorator[]) => {
  return decorators.filter(decorator => (!(hasDecorator(decorator, 'customElement'))))
}

class CustomElementTransformer extends Visitor { 
  visitModule(m: Module) {
    const moduleItem = getClassDeclaration(m.body)
    const decorator = moduleItem?.decorators?.find(decorator => hasDecorator(decorator, 'customElement')) as Decorator

    if (moduleItem && decorator) {      
      m.body.forEach(content => {
        if (swc.isExportDeclaration(content) && swc.isClasDeclaration(content.declaration)) {
          content.declaration.decorators = filterDecorators(content.declaration.decorators)
        }
        if (swc.isClasDeclaration(content)) {
          content.decorators = filterDecorators(content.decorators)
        }
      })

      const tag = (decorator?.expression as CallExpression)?.arguments[0]?.expression as StringLiteral
      const element = moduleItem.identifier.value
      if (!hasCustomElementStatement(m.body, tag.value, element)) {
        m.body.push(customElementStatement(tag, element))
      }
    }

    return m
  }
}

export function hasCustomElementStatement(items: ModuleItem[], tag: string, element: string) {
  const hasValue = (args: Argument[], value: string) => {
    return args.find(arg => (arg.expression as Identifier).value.includes(value))
  }
  return items.find(item => {
    return swc.isExpressionStatement(item)
      && swc.isCallExpression(item.expression)
      && swc.isMemberExpression(item.expression.callee)
      && swc.isIdentifer(item.expression.callee.object)
      && item.expression.callee.object.value.includes('customElements')
      && swc.isIdentifer(item.expression.callee.property)
      && item.expression.callee.property.value.includes('define')
      && hasValue(item.expression.arguments, tag)
      && hasValue(item.expression.arguments, element)
  })
}

export function customElementTransformer() {
  return (program: Program) => new CustomElementTransformer().visitProgram(program)
}