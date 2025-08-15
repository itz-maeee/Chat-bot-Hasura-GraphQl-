import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient as createWsClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { nhost } from './nhost'


// Build GraphQL endpoints from Nhost backend URL
const BACKEND_URL = import.meta.env.VITE_NHOST_BACKEND_URL
const HTTP_URL = `${BACKEND_URL}/v1/graphql`
const WS_URL = HTTP_URL.replace(/^http/i, 'ws')


// Attach fresh JWT to every HTTP request
const authLink = setContext(async (_, { headers }) => {
const token = await nhost.auth.getAccessToken()
return {
headers: {
...headers,
...(token ? { Authorization: `Bearer ${token}` } : {}),
},
}
})


const httpLink = new HttpLink({ uri: HTTP_URL })


// WebSocket link for subscriptions (with auth)
const wsLink = new GraphQLWsLink(
createWsClient({
url: WS_URL,
connectionParams: async () => {
const token = await nhost.auth.getAccessToken()
return {
headers: token ? { Authorization: `Bearer ${token}` } : {},
}
},
retryAttempts: 10,
})
)


// Route subscriptions to WS, the rest to HTTP
const splitLink = split(
({ query }) => {
const def = getMainDefinition(query)
return def.kind === 'OperationDefinition' && def.operation === 'subscription'
},
wsLink,
authLink.concat(httpLink)
)


export const apolloClient = new ApolloClient({
link: splitLink,
cache: new InMemoryCache(),
})