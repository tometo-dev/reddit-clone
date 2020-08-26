import { MikroORM } from "@mikro-orm/core"
import { ApolloServer } from "apollo-server-express"
import connectRedis from "connect-redis"
import cors from "cors"
import express from "express"
import session from "express-session"
import redis from "redis"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import { COOKIE_NAME } from "./constants"
import mikroConfig from "./mikro-orm.config"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/posts"
import { UserResolver } from "./resolvers/user"
import { MyContext } from "./types"

const main = async () => {
  const orm = await MikroORM.init(mikroConfig)
  await orm.getMigrator().up()

  const app = express()

  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
  })

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  )

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  })

  apolloServer.applyMiddleware({
    app,
    cors: false,
  })

  app.listen(4000, () => {
    console.log("server started on localhost:4000")
  })
}

main().catch((error) => {
  console.error(error)
})
