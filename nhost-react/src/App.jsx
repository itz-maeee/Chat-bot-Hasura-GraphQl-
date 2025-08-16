import { NhostProvider } from '@nhost/react'
import { nhost } from './lib/nhost.js'
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import CodeBotChat from './components/CodeBotChat'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSession(nhost.auth.getSession())
    setLoading(false)

    const unsubscribe = nhost.auth.onAuthStateChanged((_, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <NhostProvider nhost={nhost}>
      <Router>
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to= "/signin" />}/>

            <Route
              path="/chatbot"
              element={session ? <CodeBotChat /> : <Navigate to="/signin" replace />}
            />

            <Route
              path="/signin"
              element={!session ? <SignIn /> : <Navigate to="/chatbot" replace />}
            />

            <Route
              path="/signup"
              element={!session ? <SignUp /> : <Navigate to="/signin" replace />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </Router>
    </NhostProvider>
  )
}

export default App
