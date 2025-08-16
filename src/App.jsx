@@ .. @@
 function App() {
   const [session, setSession] = useState(null)
   const [loading, setLoading] = useState(true)
+  const [nhostReady, setNhostReady] = useState(false)

   useEffect(() => {
-    setSession(nhost.auth.getSession())
-    setLoading(false)
+    const initializeNhost = async () => {
+      try {
+        // Wait for Nhost to be ready
+        let attempts = 0
+        const maxAttempts = 200 // 20 seconds
+        
+        while (!nhost.auth.isReady() && attempts < maxAttempts) {
+          await new Promise(resolve => setTimeout(resolve, 100))
+          attempts++
+        }
+        
+        if (!nhost.auth.isReady()) {
+          console.error('❌ Nhost failed to initialize')
+          setLoading(false)
+          return
+        }
+        
+        setNhostReady(true)
+        setSession(nhost.auth.getSession())
+        setLoading(false)
+        
+        const unsubscribe = nhost.auth.onAuthStateChanged((_, session) => {
+          setSession(session)
+          setLoading(false)
+        })
+        
+        return unsubscribe
+      } catch (error) {
+        console.error('❌ Nhost initialization error:', error)
+        setLoading(false)
+      }
+    }

-    const unsubscribe = nhost.auth.onAuthStateChanged((_, session) => {
-      setSession(session)
-      setLoading(false)
-    })
-
-    return () => unsubscribe()
+    const cleanup = initializeNhost()
+    return () => {
+      cleanup.then(unsubscribe => unsubscribe && unsubscribe())
+    }
   }, [])

+  if (!nhostReady && loading) {
+    return (
+      <div className="min-h-screen flex items-center justify-center bg-gray-100">
+        <div className="text-center">
+          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
+          <p className="text-gray-600">Connecting to authentication service...</p>
+        </div>
+      </div>
+    )
+  }
+
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