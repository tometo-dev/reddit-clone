import { ApolloServer } from "apollo-server-express"
import connectRedis from "connect-redis"
import cors from "cors"
import express from "express"
import session from "express-session"
import Redis from "ioredis"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import { COOKIE_NAME } from "./constants"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/posts"
import { UserResolver } from "./resolvers/user"
import { MyContext } from "./types"
import { createConnection } from "typeorm"
import { User } from "./entities/User"
import { Post } from "./entities/Post"
import dotenv from "dotenv"
import { Updoot } from "./entities/Updoot"

dotenv.config()

const main = async () => {
  await createConnection({
    type: "postgres",
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    logging: true,
    synchronize: true,
    entities: [User, Post, Updoot],
  })

  const app = express()

  const RedisStore = connectRedis(session)
  const redis = new Redis({ host: process.env.REDIS_HOST })

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
        client: redis,
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
    context: ({ req, res }): MyContext => ({ req, res, redis }),
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
