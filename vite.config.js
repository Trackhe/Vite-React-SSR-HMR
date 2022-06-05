import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function configuretheServer(server, dorp) {

  server.middlewares.use(async (req, res, next) => {
    if (req.url !== "/") {
      return next()
    }

    console.log(dorp) //Check the running server mode
    const { renderInNode } = await server.ssrLoadModule(path.resolve(__dirname, "./server/src/index"))

    const indexHtml = fs.readFileSync(path.resolve(__dirname, "./index.html"), "utf-8")

    const url = new URL("http://localhost:3000/" + req.url)
    const template = await server.transformIndexHtml(url.toString(), indexHtml)

    const head = template.match(/<head>(.+?)<\/head>/s)[1]

    return renderInNode( res, head )
  });
}

function ssrPlugin() {
  /**
   * @type {import('vite').Plugin}
   */
  return {
    name: "ssrPlugin",
    configureServer(server){configuretheServer(server, "dev")},
    configurePreviewServer(server){configuretheServer(server, "preview")}
  };
}

export default defineConfig(({ command, mode }) => {
  console.log(command + " : " + mode)
  if (command === "serve" && mode === "development") {
    return {
      plugins: [react(), ssrPlugin()]
    }
  } else {
    // command === 'build'
    return {
      plugins: [react(), ssrPlugin()],
      build: {
        minify: false
      }
    }
  }
})