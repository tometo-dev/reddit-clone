import { Request, Response } from "express"
import { Redis } from "ioredis"
import { createUpdootLoader } from "./utils/create-updoot-loader"
import { createUserLoader } from "./utils/create-user-loader"

export type MyContext = {
  req: Request
  res: Response
  redis: Redis
  userLoader: ReturnType<typeof createUserLoader>
  updootLoader: ReturnType<typeof createUpdootLoader>
}
