@@ .. @@
   const handleSubmit = async (e) => {
     e.preventDefault()
 
     if (formData.password !== formData.confirmPassword) {
       setToast({ type: 'error', message: 'Passwords do not match' })
       return
     }
 
+    if (formData.password.length < 6) {
+      setToast({ type: 'error', message: 'Password must be at least 6 characters long' })
+      return
+    }
+
     const { user, error: signUpError } = await signUp({
       email: formData.email,
       password: formData.password
     })
 
     if (signUpError) {
-      setToast({ type: 'error', message: signUpError.message })
+      setToast({ type: 'error', message: signUpError })
       return
     }
 
     if (user) {
       setUserEmail(formData.email)
       setToast({ type: 'success', message: '✅ Account created successfully! Please verify your email.' })
       setTimeout(() => setShowVerification(true), 1500)
     }
   }