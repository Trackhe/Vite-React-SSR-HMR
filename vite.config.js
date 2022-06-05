import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function configuretheServer(server, dorp) {

  server.middlewares.use(async (req, res, next) => {

    console.log("hiho")

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

/*function configurethePreviewServer(server, dorp) {

  server.middlewares.use(async (req, res, next) => {
    if (req.url !== "/") {
      return next()
    }

    console.log(dorp) //Check the running server mode
    const { renderInNode } = await server.ssrLoadModule(path.resolve(__dirname, "./server/src/index"))

    const indexHtml = fs.readFileSync(path.resolve(__dirname, "./index.html"), "utf-8")

    const url = new URL("http://localhost:5173/" + req.url)
    const template = await server.transformIndexHtml(url.toString(), indexHtml)

    const head = template.match(/<head>(.+?)<\/head>/s)[1]

    return renderInNode( res, head )
  });
}*/

function ssrPlugin() {
  console.log("i m running")
  return {
    name: "ssrPlugin",
    configureServer(server){configuretheServer(server, "dev")}
    //configurePreviewServer(server){configurethePreviewServer(server, "preview")}
  };
}

export default defineConfig(({ command, mode }) => {
  console.log(command + " : " + mode)
  if (command === "serve" && mode === "development") {
    console.log("serve and dev mode running")
    return {
      server: { port: 3000 },
      plugins: [react(), ssrPlugin()]
    }
  } else {
    console.log("prod preview mode running")
    return {
      //plugins: [react()],
      preview: { 
        port: 3000
      }
      

    }
  }
})