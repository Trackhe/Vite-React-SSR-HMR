import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function ssrPlugin() {
  return {
    name: "ssrPlugin",
    configureServer(server){
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/") {
          return next()
        }

        const { renderInNode } = await server.ssrLoadModule(path.resolve(__dirname, "./server/src/index"))
        console.log("before error")
        const indexHtml = fs.readFileSync(path.resolve(__dirname, "./server/src/index.html"), "utf-8")
    
        const url = new URL("http://localhost:3000/" + req.url)
        const template = await server.transformIndexHtml(url.toString(), indexHtml)
    
        const head = template.match(/<head>(.+?)<\/head>/s)[1]
    
        return renderInNode( res, head )
      })
    }
  }
}

export default defineConfig(() => {
  return {
    server: { port: 3000 },
    plugins: [react(), ssrPlugin()]
  }
})