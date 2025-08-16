// Wait for Nhost to be ready
const waitForNhostReady = async (timeout = 20000) => {
  const startTime = Date.now()
  
  while (!nhost.auth.isReady() && (Date.now() - startTime) < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  if (!nhost.auth.isReady()) {
    throw new Error('Nhost client failed to initialize within timeout period')
  }
}

// 🔹 Sign Up Hook
export const useSignUpEmailPassword = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const signUp = async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      // Wait for Nhost to be ready
      await waitForNhostReady()
      
      // Wait for Nhost to be ready
      await waitForNhostReady()
      
      const res = await nhost.auth.signUp({ email, password })
      console.log('🔍 Raw Nhost Response:', res) // Debug
      setLoading(false)

      if (res.error) {
        const errorMessage = res.error.message || JSON.stringify(res.error)
        setError(errorMessage)
        return { user: null, error: errorMessage }
      }

      return { user: res.user, error: null }
    } catch (err) {
      console.error('❌ Sign-up error:', err)
      setLoading(false)
      setError(err.message || 'Unexpected error')
      return { user: null, error: err.message }
    }
  }

  return { signUp, loading, error }
}