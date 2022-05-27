//import React from "react"
import ReactDomServer from 'react-dom/server'
import App from '../../shared/src/App'

export default (req, res) => {

  const stream = ReactDomServer.renderToPipeableStream(
    <App />, {
    onShellReady() {
      res.statusCode = didError ? 500 : 200;
      res.setHeader('Content-type', 'text/html');
      res.write(html[0] + '<div id="root">')
      stream.pipe(res);
    },
    onShellError(err) {
      res.statusCode = 500;
      res.send(
        '<p>Error Loading...</p>'
      );
      console.log(err);
    },
    onAllReady() {
      res.write('</dev>' + html[1]);
    },
    onError(err) {
      didError = true;
      console.error(err);
    },
  })

  //res.flush();
  //setTimeout(() => stream.abort(), 2000);

}