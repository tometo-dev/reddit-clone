import { MikroORM } from "@mikro-orm/core"
import { ApolloServer } from "apollo-server-express"
import express from "express"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import mikroConfig from "./mikro-orm.config"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/posts"


const main = async () => {
  const orm = await MikroORM.init(mikroConfig)
  await orm.getMigrator().up()

  const app = express()

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  })

  apolloServer.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log("server started on localhost:4000")
  })
}

main().catch((error) => {
  console.error(error)
})
