import { Visitor } from '@swc/core/Visitor.js'
import { getClassDeclaration, hasDecorator, updateMemberDecorators } from 'shared'

import type { 
  CallExpression,
  ClassMember,
  ClassProperty,
  Identifier,
  Module,
  Program 
} from '@swc/core'

import * as swc from 'swc-ast-helpers'

const hasQueryState = (member: ClassMember, key: string) => 
  swc.isClassProperty(member) && member?.decorators?.find(decorator => hasDecorator(decorator, key))

const Query = Object.freeze({
  query: 'querySelector',
  queryAll: 'querySelectorAll'
})

const createGetProperties = (members: ClassMember[]) => {
  return members.map((member: ClassProperty) => {
    const expression = member.decorators[0]?.expression as CallExpression
    const value = (expression?.callee as Identifier).value
    const shadowRoot = swc.createMemberExpression(swc.createThisExpression(), swc.createIdentifer('renderRoot'))
    const statement = swc.createReturnStatement(
      swc.createCallExpression(
        swc.createOptionalChainingExpression(
          swc.createMemberExpression(shadowRoot, swc.createIdentifer(Query[value]))
        ), expression.arguments
      ))
    return swc.createGetter(member.key as Identifier, swc.createBlockStatement([ statement ]))
  })
}

class QueryTransformer extends Visitor {
  visitModule(m: Module) {
    const moduleItem = getClassDeclaration(m.body)
    const members = moduleItem?.body?.filter(member => 
      hasQueryState(member, 'query') || hasQueryState(member, 'queryAll'))

    if (moduleItem && members?.length >  0) {
      const getters = createGetProperties(members)
      const toUpdateMember = (members: ClassMember[]) => {
        const newMembers = updateMemberDecorators(members, Object.keys(Query))
        return [ ...newMembers, ...getters ]
      }
      m.body.forEach(content => {
        if (swc.isExportDeclaration(content) && swc.isClasDeclaration(content.declaration)) {
          content.declaration.body = toUpdateMember(content.declaration.body)
        }
        if (swc.isClasDeclaration(content)) {
          content.body = toUpdateMember(content.body)
        }
      })
    }

    return m
  }
}

export function queryTransformer() {
  return (program: Program) => new QueryTransformer().visitProgram(program)
}
