import { useState } from 'react'
import { nhost } from '../lib/nhost'

// ------------------- Sign Up -------------------
export const useSignUpEmailPassword = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const signUp = async (data) => {
    setLoading(true)
    setError(null)

    try {
      if (!data.email || !data.password) {
        throw new Error('Email and password are required')
      }
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Use Nhost auth
      const { user, error: nhostError } = await nhost.auth.signUp({
        email: data.email,
        password: data.password
      })

      if (nhostError) {
        throw nhostError
      }

      return { user, error: null }
    } catch (err) {
      let message = 'Sign up failed'
      
      if (err instanceof Error) {
        message = err.message
      }
      
      // Handle specific Nhost error codes
      if (err?.status === 409 || err?.error === 'email-already-in-use') {
        message = 'An account with this email already exists. Please try signing in instead.'
      } else if (err?.status === 422) {
        message = 'Invalid email or password format. Please check your input.'
      } else if (err?.status === 429) {
        message = 'Too many attempts. Please wait a moment before trying again.'
      } else if (err?.message?.includes('email-already-in-use')) {
        message = 'An account with this email already exists. Please try signing in instead.'
      }
      
      setError(message)
      return { user: null, error: { message } }
    } finally {
      setLoading(false)
    }
  }

  return { signUp, loading, error }
}

// ------------------- Sign In -------------------
export const useSignInEmailPassword = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const signIn = async (data) => {
    setLoading(true)
    setError(null)

    try {
      if (!data.email || !data.password) {
        throw new Error('Email and password are required')
      }

      // Use Nhost auth
      const { session, user, error: nhostError } = await nhost.auth.signIn({
        email: data.email,
        password: data.password
      })

      if (nhostError) {
        throw nhostError
      }

      return { session, user, error: null }
    } catch (err) {
      let message = 'Sign in failed'
      
      if (err instanceof Error) {
        message = err.message
      }
      
      // Handle specific Nhost error codes
      if (err?.status === 401 || err?.error === 'invalid-email-password') {
        message = 'Invalid email or password. Please check your credentials.'
      } else if (err?.status === 429) {
        message = 'Too many login attempts. Please wait a moment before trying again.'
      } else if (err?.status === 422) {
        message = 'Invalid email format. Please enter a valid email address.'
      } else if (err?.message?.includes('invalid-email-password')) {
        message = 'Invalid email or password. Please check your credentials.'
      }
      
      setError(message)
      return { session: null, user: null, error: { message } }
    } finally {
      setLoading(false)
    }
  }

  return { signIn, loading, error }
}