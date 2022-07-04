import { parseSync } from '@swc/core'

import { getClassDeclaration, hasDecorator, swcTransformer } from 'shared'
import { customElementTransformer, hasCustomElementStatement } from 'decorators/custom-element'
import { inlinePropertyTransformer } from 'decorators/property'
import { queryTransformer } from 'decorators/query'

describe('decorators', () => {

  it('should transform customElement decorators', () => {
    const content = `
      import { LitElement } from 'lit'
      import { customElement } from 'lit/decorators.js'
      
      @customElement('hello-world')
      export class HelloWorld extends LitElement { }
    `
    
    const { code } = swcTransformer(content, './file.ts', {
      plugins: [ customElementTransformer() ]
    })

    const m = parseSync(code)

    const moduleItem = getClassDeclaration(m.body)
    const decorator = moduleItem?.decorators?.find(decorator => hasDecorator(decorator, 'customElement'))

    expect(decorator).toBeUndefined()
    expect(hasCustomElementStatement(m.body, 'hello-world', 'HelloWorld')).toBeDefined()
    expect(code).toMatchSnapshot()
  })

  it('should transform property decorators', () => {
    const content = `
      import { LitElement } from 'lit'
      import { customElement } from 'lit/decorators.js'
      
      export class HelloWorld extends LitElement { 
        @property({ type: Number }) message: string
      }
    `

    const { code } = swcTransformer(content, './file.ts', {
      plugins: [ inlinePropertyTransformer() ]
    })

    expect(code).toMatchSnapshot()
  })

  it('should transform property decorators existing properties', () => {
    const content = `
      import { LitElement } from 'lit'
      import { customElement } from 'lit/decorators.js'
      
      export class HelloWorld extends LitElement { 
        @property({ reflect: true }) message: string = "World"

        static properties = {
          count: { type: Number }
        }
      }
    `

    const { code } = swcTransformer(content, './file.ts', {
      plugins: [ inlinePropertyTransformer() ]
    })

    expect(code).toMatchSnapshot()
  })

  it('should transform query/queryAll decorators', () => {
    const content = `
      import { LitElement } from 'lit'
      import { query, queryAll } from 'lit/decorators.js'
      
      export class HelloWorld extends LitElement { 
        @query('bto-input') element;
        @queryAll('bto-element') el;
      }
    `

    const { code } = swcTransformer(content, './file.ts', {
      plugins: [ queryTransformer() ]
    })

    expect(code).toMatchSnapshot()
  })

  it('should transform', () => {
    const content = `
      import { LitElement, html } from 'lit'
      import { customElement, property, query } from 'lit/decorators.js'

      @customElement('hello-world')
      export class HelloWorld extends LitElement {
        @property({ type: String }) message: string = 'World'
        @query('i-element') element
        @queryAll('i-input-element') inputElement
      }
    `

    const { code } = swcTransformer(content, './file.ts', {
      plugins: [ 
        customElementTransformer(),
        inlinePropertyTransformer(),
        queryTransformer() 
      ]
    })

    expect(code).toMatchSnapshot()
  })
  
})