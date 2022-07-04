import { Visitor } from '@swc/core/Visitor.js'
import * as swc from 'swc-ast-helpers'

import type { 
  Module,
  ExportDefaultExpression, 
  StringLiteral, 
  VariableDeclaration, 
  VariableDeclarator, 
  Expression, 
  Identifier
} from '@swc/core'

import type { Options } from 'shared'

const isVariableDeclarator = (declaration: VariableDeclarator, value: string) => 
  swc.isVariableDeclarator(declaration) 
    && swc.isIdentifer(declaration.id)
    && declaration.id.value.includes(value)
    && swc.isStringLiteral(declaration.init as Expression)

export class Transformer extends Visitor {
  constructor(private options?: Options) {
    super()
  }

  visitModule(m: Module) {
    const defaultExport = m.body.find(item => swc.isExportDefaultExpression(item)) as ExportDefaultExpression
    if (defaultExport) {
      const value = (defaultExport.expression as Identifier).value

      const item = m.body.find(item => {
        return swc.isVariableDeclaration(item) 
          && item.declarations.find(declaration => isVariableDeclarator(declaration, value))
      }) as VariableDeclaration

      const { importPackage = 'lit' } = this.options || {}
      const cssTag = swc.createIdentifer('cssTag')

      const createTaggedTemplate = (value: string) => 
        swc.createTaggedTemplateExpression(
          cssTag, 
          swc.createTemplateLiteral([ swc.createTemplateElement(value, true) ]))

      if (item) {
        const index = m.body.indexOf(item)

        item.declarations = item.declarations.map(declaration => {
          if (isVariableDeclarator(declaration, value)) {
            const rawValue = (declaration.init as StringLiteral).value
            declaration.init = createTaggedTemplate(rawValue)
          }
          return declaration
        })
        m.body[index] = item
      }

      if (!item) {
        m.body.forEach(item => {
          if (swc.isExportDefaultExpression(item)) {
            const rawValue = (item.expression as StringLiteral).value
            item.expression = createTaggedTemplate(rawValue)
          }
        })
      }
      
      m.body.unshift(
        swc.createImportDeclaration(
          [ swc.createNamedImportSpecifier(cssTag, 'css') ], 
          importPackage
        ))
    }
    return m
  }
}

export class InlineTransformer extends Visitor {
  visitModule(m: Module) {
    m.body.forEach(item => {
      if (swc.isImportDeclaration(item) && (item.source.value.includes('.css') || item.source.value.includes('.scss'))) {
        item.source = swc.createStringLiteral(item.source.value + '?inline')
      }
    })
    return m
  }
}
