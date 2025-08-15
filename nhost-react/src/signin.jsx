import { useState } from 'react'
import { useSignInEmailPasswordless } from '@nhost/react'

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const { signInEmailPasswordless, error } = useSignInEmailPasswordless()

  const handleSubmit = async (e) => {
  e.preventDefault();
  const { user, session, error } = await signIn(formData);

  // ✅ Step 3: debug the result
  console.log('SignIn result:', { user, session, error });

  if (user && !error) {
    setSuccess(true);
    console.log('User signed in:', user);
  }
};


  const handleSignIn = async (event) => {
    event.preventDefault()

    setLoading(true)
    const { error } = await signInEmailPasswordless(email)

    if (error) {
      console.error({ error })
      return
    }

    setLoading(false)
    alert('Magic Link Sent!')
  }

  return (
    <div>
      <h1>Todo Manager</h1>
      <p>powered by Nhost and React</p>
      <form onSubmit={handleSignIn}>
        <div>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            required={true}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <button disabled={loading}>
            {loading ? <span>Loading</span> : <span>Send me a Magic Link!</span>}
          </button>
        </div>
        {error && <p>{error.message}</p>}
      </form>
    </div>
  )
}