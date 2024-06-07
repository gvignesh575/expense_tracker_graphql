import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"

import { expressMiddleware } from "@apollo/server/express4"

import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"

import http from "http"
import cors from "cors"
import express from "express"
import dotenv from "dotenv"

import mergedResolvers from "./resolvers/index.js"

import mergedTypedDefs from "./typeDefs/index.js"
import { connectDB } from "./db/connectDB.js"

dotenv.config();

// Creating Express Server for conversion
const app = express();

// Creating the http server using the created express server
const httpServer = http.createServer(app);


const server = new ApolloServer({
  typeDefs: mergedTypedDefs,
  resolvers : mergedResolvers,
  // Converting Apollo Server to Express Server
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
})

await server.start();

app.use(
  '/',
  cors(),
  express.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    // Context to be passed among all the resolvers here passing the request
    context: async ({ req }) => ({ req }),
  }),
);

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));


await connectDB();

console.log(`🚀 Server ready at http://localhost:4000/`);