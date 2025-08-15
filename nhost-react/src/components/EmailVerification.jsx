import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { nhost } from '../lib/nhost'

const EmailVerification = ({ email, onResendSuccess }) => {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')

  const handleResendVerification = async () => {
    setIsResending(true)
    setResendMessage('')
    setResendError('')

    try {
      const { error } = await nhost.auth.sendVerificationEmail({ email })
      
      if (error) {
        throw error
      }

      setResendMessage('Verification email sent successfully! Please check your inbox.')
      if (onResendSuccess) {
        onResendSuccess()
      }
    } catch (err) {
      setResendError(err.message || 'Failed to resend verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Check Your Email</h2>
          <p className="text-gray-600 mt-2">We've sent a verification link to</p>
          <p className="text-green-600 font-semibold mt-1">{email}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return here to sign in</li>
              </ol>
            </div>
          </div>
        </div>

        {resendMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              {resendMessage}
            </div>
          </div>
        )}

        {resendError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {resendError}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Resend Verification Email
              </>
            )}
          </button>

          <Link
            to="/signin"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Didn't receive the email? Check your spam folder or</p>
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="text-green-600 hover:text-green-700 font-medium underline disabled:opacity-50"
          >
            click here to resend
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification