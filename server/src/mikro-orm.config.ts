import { MikroORM } from "@mikro-orm/core"
import path from "path"
import { __prod__ } from "./constants"
import { Post } from "./entities/Post"
import { User } from "./entities/User"

require("dotenv").config()

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  host: process.env.POSTGRES_HOST,
  dbName: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  type: "postgresql",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0]
