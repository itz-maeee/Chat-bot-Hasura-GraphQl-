@@ .. @@
   const handleSubmit = async (e) => {
   e.preventDefault()
   console.log("Attempting sign in with:", formData)
 
   const { session, error: authError } = await signIn(formData)
 
   console.log("Session:", session)
   console.log("Auth Error:", authError)
 
   if (session) {
     navigate('/chatbot')
+  } else if (authError) {
+    // Error is already set in the hook, no need to do anything else
+    console.error("Sign in failed:", authError)
   }
 }