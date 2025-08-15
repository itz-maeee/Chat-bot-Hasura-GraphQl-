import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { NhostProvider, Authenticated } from '@nhost/react'
import { nhost } from './lib/nhost'
import { apolloClient } from './lib/apollo'
import App from './App'


ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
<NhostProvider nhost={nhost}>
{/* Only render the app when the user is authenticated */}
<Authenticated fallback={<div>Please sign in…</div>}>
<ApolloProvider client={apolloClient}>
<App />
</ApolloProvider>
</Authenticated>
</NhostProvider>
</React.StrictMode>
)