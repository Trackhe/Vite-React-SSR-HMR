import { useState } from 'react'

import react_logo from './assets/images/react_logo.svg'
import vite_logo from './assets/images/vite_logo.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <div className='logo-wrapper'><div className='React-logo-wrapper'><img src={react_logo} className="React-logo" alt="logo" /></div><img src={vite_logo} className="Vite-logo" alt="logo" /></div>
        <p>Hello Vite + React 18 + SSR!</p>
        <p>
          <button type="button" onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
        </p>
        <p>
          Edit <code>shared/src/App.jsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}

export default App
