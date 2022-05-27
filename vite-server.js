const http = require('http')
const path = require('path')

const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD
const port = +process.env.PORT || 3000
const index = isProd ? resolve('build/client/index.html') : resolve('index.html')
const template = fs.readFileSync(index, 'utf-8')

function queryStringToObject(query) {
  const result = query.match(/\?(.*)/)
  if (!result) return {}
  return Object.fromEntries(new URLSearchParams(result[1]))
}

let vite = null
let staticServe = null
let server

createVitehandle().then(handle => {
  server = http.createServer((req, res) => {
    if (isProd) {
        require('compression')()(req, res, () => {
          handle(req, res)
        })
    } else {
      handle(req, res)
    }
  })

  app.listen(port, () => {
    console.log(`StartAt: http://localhost:${port}`)
  })  
})

async function createVitehandle(){
  if (isProd) {
    vite = await require('vite').createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: true,
      },
    })
  } else {
    staticServe = require('serve-static')(path.resolve('.', 'build/client'), {
      index: false,
    })
  }

  return async (req, res) => {
    if (isProd) {
      vite.middlewares(req, res, handleRender(req, res))
    } else {
      staticServe(req, res, handleRender(req, res))
    }
  }
}


async function handleRender(req, res) {
  try {
    const url = req.url

    let render
    if (isProd) {
      // always read fresh template in dev
      template = await vite.transformIndexHtml(url, template )
      render = (await vite.ssrLoadModule('/server/src/index.jsx')).render
    } else {
      render = require(path.resolve(".", 'build/server/index.js')).render
    }

    const context = {
      isSSR: true,
      query: req.query || queryStringToObject(req.url),
      url: req.originalUrl,
      req,
      }

    const { appHtml, propsData, redirect } = await render(url, context)

    if (redirect) {
      res.statusCode = 302
      res.setHeader('Location', redirect)
      res.end(`Location:${redirect}`)
      return
    }

    const ssrDataText = JSON.stringify(propsData).replace(/\//g, '\\/')
    const html = template
    .replace(
      '<!--init-props-->',
      `<script id="ssr-data" type="text/json">${ssrDataText}</script>`,
    )
    .replace(`<!--app-html-->`, appHtml)
    .replace(
      `<!--init-header-->`,
      `${helmet.meta.toString()}${helmet.title.toString()}${helmet.script.toString()}`,
    )

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; utf-8')
    res.end(html)
  } catch (err) {
    dev && vite.ssrFixStacktrace(err)
    res.statusCode = 500
    if (dev) {
      console.error(err)
      res.end(
        `
        <style>
        html {
          font-size: 14px;
        }
        main {
          max-width: 800px;
          margin: 5rem auto;
          border: 3px solid red;
          border-radius: 12px;
          padding: 12px;
        }
        pre {
          white-space: pre-line;
        }
        code {
          display: block;
          margin: 6px auto;
        }
        </style>
        <main>
        <p>${err.message}</p>
        <p style="color: red;">Error at file: ${err.id}</p>
      
        <div>
        <p> 
          Frame at:
        </p>
        <pre>
        ${err.frame
          ?.split('\n')
          .map((line) => `<code>${line}</code>`)
          .join('')}
        </pre>
        </div>

        <div>
        <p>Output: </p>
        <pre>
        ${err.pluginCode
          ?.split('\n')
          .map((line) => `<code>${line}</code>`)
          .join('')}
        </pre>
        </div>
        </main>
        `,
      )
    } else {
      res.end('Server Error')
    }
  }
}