import React from "react"
import ReactDomServer from 'react-dom/server'

import path from "path"
import fs from "fs"
__dirname = path.resolve();

import App from "../../shared/src/App";

/**
 * Streaming SSR in a Node.js runtime
 */

//const html = fs.readFileSync(path.resolve(__dirname, `./server/src/template.html`), "utf-8").split('<div id="root"></div>')

let didError = false;
export function renderInNode( res, head ) {

  const { pipe, abort } = ReactDomServer.renderToPipeableStream(
    <React.StrictMode>
      <App head={head} />
    </React.StrictMode>, {
      bootstrapModules: ["../../client/src/index.jsx"],
      onShellReady() {
        res.statusCode = didError ? 500 : 200;
        res.setHeader('Content-type', 'text/html');
        //res.write(html[0] + '<div id="root">')
        pipe(res);
      },
      onShellError(err) {
        res.statusCode = 500;
        res.send(
          '<!doctype html><p>Error Loading...</p><script src="clientrender.js"></script>'
        );
        console.log(err);
      },
      onAllReady() {
        //res.write('</dev>' + html[1]);
      },
      onError(err) {
        didError = true;
        console.error(err);
      },
  });


  // Abandon and switch to client rendering if enough time passes.
  // Try lowering this to see the client recover.
  setTimeout(abort, 2000);
}
