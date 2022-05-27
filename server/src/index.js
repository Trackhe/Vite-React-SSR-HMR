const fs = require("fs")
const path = require("path")
const express = require("express")
const createViteServer = require("vite").createServer
const ReactDomServer = require("react-dom/server")

const html = fs.readFileSync(path.resolve("./", "index.html"), "utf-8").split('<div id="root"></div>')

async function createServer() {
  const server = express()

  // Create Vite server in middleware mode. This disables Vite's own HTML
  // serving logic and let the parent server take control.
  //
  // In middleware mode, if you want to use Vite's own HTML serving logic
  // use `'html'` as the `middlewareMode` (ref https://vitejs.dev/config/#server-middlewaremode)
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' }
  })
  // use vite's connect instance as middleware
  server.use(vite.middlewares)



  server.get('*', async (req, res) => {


    const { render } = await vite.ssrLoadModule("render.jsx")
    console.log(render(req.originalUrl))

  })

  server.listen(3000, () => {
    console.log("Listening on port 3000...")
  })

}

createServer()
