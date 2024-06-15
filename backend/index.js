import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { expressMiddleware } from "@apollo/server/express4";

import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import http from "http";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { buildContext } from "graphql-passport";

import mergedResolvers from "./resolvers/index.js";

import mergedTypedDefs from "./typeDefs/index.js";
import { connectDB } from "./db/connectDB.js";

import { configurePassport } from "./passport/passport.config.js";
import path from "path";

dotenv.config();
configurePassport();

const __dirname = path.resolve(); // gives us the root of the application which is root directory path

// Creating Express Server for conversion
const app = express();

// Creating the http server using the created express server
const httpServer = http.createServer(app);

//connects the express session to the mongodb
const MongoDBStore = connectMongo(session);

// connecting to the mongodb to store the user sessions
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

store.on("error", (err) => {
  console.log(err);
});

// use express session as a middleware and setting the session secret
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // this option specifies whether to save the session to the store which is mongodb on every request 99% will be false because we dont want to save multiple session for single user
    saveUninitialized: false, // option specifies whether to save uninitialized sessions
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true, // this option prevents the cross site scripting attacks
    },
    store: store,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
  typeDefs: mergedTypedDefs,
  resolvers: mergedResolvers,
  // Converting Apollo Server to Express Server
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  "/graphql",
  cors({
    //react app
    origin: "http://localhost:3000",
    // send our cookies alognside the request
    credentials: true,
  }),
  express.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    // Context to be passed among all the resolvers here passing the request
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

await connectDB();

console.log(`🚀 Server ready at http://localhost:4000/graphql`);
