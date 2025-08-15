import { NhostProvider } from '@nhost/react'
import { nhost } from './lib/nhost.js'
import './App.css'

import SignIn from './components/SignIn'

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <SignIn />
    </NhostProvider>
  )
}

export default App