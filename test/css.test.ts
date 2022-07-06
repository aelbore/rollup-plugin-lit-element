
import { Transformer } from 'css'

import { swcTransformer } from 'shared'

describe('css', () => {

  it('should update export to css template literals', () => {
    const content = `
      import { createHotContext as __vite__createHotContext } from "/@vite/client";
      import.meta.hot = __vite__createHotContext("/src/hello-world.scss");
      import { updateStyle as __vite__updateStyle, removeStyle as __vite__removeStyle } from "/@vite/client";
      const __vite__id = "/Users/override/Desktop/workspace/github/vite-lit-stater/src/hello-world.scss";
      const __vite__css = ":host h1 { color: blue; border: 1px solid green; padding: 10px; }";
      __vite__updateStyle(__vite__id, __vite__css);
      import.meta.hot.accept();
      export default __vite__css;
      import.meta.hot.prune(()=>__vite__removeStyle(__vite__id));
    `

    const { code } = swcTransformer(content, './file.ts', {
      plugins: [ (p) => new Transformer({ importPackage: 'lit' }).visitProgram(p) ]
    })

    expect(code).toMatchSnapshot()
  })

  it('should update the css template literals when it is default arrow', () => {
    const content = `
      export default (() => ":host h1{color:#00f;border:1px solid green;padding:10px}")()
    `

    const { code } = swcTransformer(content, './file.ts', {
      plugins: [ (p) => new Transformer({ importPackage: 'lit' }).visitProgram(p) ]
    })

    expect(code).toMatchSnapshot()
  })

})