import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants"
import mikroConfig from "./mikro-orm.config"

const main = async () => {
  const orm = await MikroORM.init(mikroConfig)
  orm.getMigrator().up()

  // const post = orm.em.create(Post, { title: "My first post" })
  // await orm.em.persistAndFlush(post)
}

main().catch((error) => {
  console.error(error)
})
