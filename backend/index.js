import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
 
import mergedResolvers from "./resolvers/index.js"

import mergedTypedDefs from "./typeDefs/index.js"

const server = new ApolloServer({
  typeDefs: mergedTypedDefs,
  resolvers : mergedResolvers,
})
 
const { url } = await startStandaloneServer(server)
 
console.log(`🚀 Server ready at ${url}`)