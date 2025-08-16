@@ .. @@
 import { NhostClient } from '@nhost/nhost-js'

+// Debug environment variables
+console.log('🔍 Environment variables:', {
+  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
+  region: import.meta.env.VITE_NHOST_REGION,
+  backendUrl: import.meta.env.VITE_NHOST_BACKEND_URL
+})
+
 export const nhost = new NhostClient({
   subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
   region: import.meta.env.VITE_NHOST_REGION,
+  // Add explicit backend URL if needed
+  ...(import.meta.env.VITE_NHOST_BACKEND_URL && {
+    backendUrl: import.meta.env.VITE_NHOST_BACKEND_URL
+  })
 })