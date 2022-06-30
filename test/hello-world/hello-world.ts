import { LitElement, html } from 'lit'

import '/@/hello-world.scss'

class HelloWorld extends LitElement {

  render() {
    return html `<h1>Hello World</h1>`
  }
}

customElements.define('hello-world', HelloWorld)