import { Visitor } from '@swc/core/Visitor.js'
import { getClassDeclaration, hasDecorator } from 'shared'

import type { 
  CallExpression, 
  ClassMember, 
  KeyValueProperty, 
  Identifier, Module, 
  ObjectExpression, 
  Program, 
  ClassProperty, 
  Property, 
  SpreadElement,
  Constructor,
  Expression
} from '@swc/core'

import * as swc from 'swc-ast-helpers'

const hasMemberProperty = (member: ClassMember) => 
  swc.isClassProperty(member) && member.decorators.find(decorator => hasDecorator(decorator, 'property'))

const createKeyValueProps = (members: ClassMember[]) => {
  return members.reduce((value, member) => {
    if (swc.isClassProperty(member)) { 
      const decorator = member.decorators.find(decorator => hasDecorator(decorator, 'property'))
      if (decorator) {
        const key = (member.key as Identifier).value
        const args = (decorator?.expression as CallExpression)?.arguments
        const expression = swc.createObjectExpression(
          (args[0]?.expression as ObjectExpression)?.properties 
            ?? [ swc.createKeyValueProperty('type', swc.createIdentifer('String')) ]
        )
        value.push(swc.createKeyValueProperty(key, expression))
      }
    }
    return value
  }, [] as Property[])
}

const createStaticProperties = (members: ClassMember[]) => {
  const props = createKeyValueProps(members)

  const getProperties = (members: ClassMember[]) => {
    return members.find(member => {
      return swc.isClassProperty(member) 
        && swc.isIdentifer(member.key)
        && member.key.value.includes('properties')
    })
  }
  
  const property = (
    getProperties(members) 
      ?? swc.createClassProperty('properties', swc.createObjectExpression([]), { isStatic: true })
  ) as ClassProperty

  const castProp = (prop: Property | SpreadElement) => ((prop as KeyValueProperty).key as Identifier).value

  const propertyValue = property.value as ObjectExpression
  const properties = propertyValue.properties.map(prop => castProp(prop)) || []

  props.forEach(prop => {
    const value = castProp(prop)
    if (!properties.includes(value)) {
      (property.value as ObjectExpression).properties.push(prop)
    }
  })

  return property
}

const updateClassMembers = (members: ClassMember[]) => {
  return members.filter(member => {
     return !(swc.isClassProperty(member) && swc.isIdentifer(member.key) && member.key.value.includes('properties'))
      && !swc.isConstructor(member)
      && !hasMemberProperty(member)
  })
}

const createConstructor = (members: ClassMember[], ctor: Constructor) => {
  const statements = members.map(member => {
    const property = (member as ClassProperty)
    const key = (property.key as Identifier).value

    const left = swc.createMemberExpression(swc.createThisExpression(), swc.createIdentifer(key))
    const right = ((property.value as Identifier) ?? swc.createNullLiteral()) as Expression

    return swc.createExpressionStatement(swc.createAssignmentExpression(left, right))
  })

  const value = ctor ?? 
    swc.createConstructor(
      swc.createBlockStatement([ 
        swc.createExpressionStatement(swc.createCallExpression(swc.createSuper())) 
      ]))

  value.body = swc.createBlockStatement([ ...value.body.stmts, ...statements ])

  return value
}

class PropertyTransformer extends Visitor {
  visitModule(m: Module) {
    const moduleItem = getClassDeclaration(m.body)
    const members = moduleItem?.body?.filter(member => hasMemberProperty(member))

    if (moduleItem && members?.length > 0) {
      const ctor = createConstructor(members, moduleItem.body.find(item => swc.isConstructor(item)) as Constructor)
      const toUpdateMember = (members: ClassMember[]) => [ createStaticProperties(members), ctor, ...updateClassMembers(members) ]
      
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

export function inlinePropertyTransformer() {
  return (program: Program) => new PropertyTransformer().visitProgram(program)
}