import React from 'react'
import ReactDOMClient from 'react-dom/client'
import App from "../../shared/src/App"

const container = document.getElementById('root');
const root = ReactDOMClient.hydrateRoot(container, 
<React.StrictMode>
  
    <App />

</React.StrictMode>);