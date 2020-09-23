import { ApolloServer } from "apollo-server-express"
import connectRedis from "connect-redis"
import cors from "cors"
import "dotenv-safe/config"
import express from "express"
import session from "express-session"
import Redis from "ioredis"
import path from "path"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import { createConnection } from "typeorm"
import { COOKIE_NAME, __prod__ } from "./constants"
import { Post } from "./entities/Post"
import { Updoot } from "./entities/Updoot"
import { User } from "./entities/User"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/posts"
import { UserResolver } from "./resolvers/user"
import { MyContext } from "./types"
import { createUpdootLoader } from "./utils/create-updoot-loader"
import { createUserLoader } from "./utils/create-user-loader"

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    // synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post, Updoot],
  })

  // run db migrations when server starts
  await conn.runMigrations()

  const app = express()

  const RedisStore = connectRedis(session)
  const redis = new Redis(process.env.REDIS_URL)

  app.set("trust proxy", 1)

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
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
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax",
        domain: __prod__ ? ".sudhanshu-ranjan.tech" : undefined,
      },
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  })

  apolloServer.applyMiddleware({
    app,
    cors: false,
  })

  app.listen(Number(process.env.PORT), () => {
    console.log("server started on localhost:4000")
  })
}

main().catch((error) => {
  console.error(error)
})
