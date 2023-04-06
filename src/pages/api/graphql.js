import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import typeDefs from "@/graphql/typeDefs.js";
import resolvers from "@/graphql/resolvers.js";
import allowCors from "@/utils/cors.js";
import mongoose from "mongoose";

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

mongoose
  .connect(process.env.NEXT_PUBLIC_MONGODB_URI)
  .then(() => {
    console.log("Server connected to DB");
  })
  .catch((err) => console.log(err));

const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => ({ req, res }),
});

export default allowCors(handler);
