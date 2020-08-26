import { User } from "../entities/User"
import { MyContext } from "../types"
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql"
import argon2 from "argon2"
import { EntityManager } from "@mikro-orm/postgresql"
import { COOKIE_NAME } from "../constants"
import { validateRegister } from "../utils/validate-register"

@InputType()
export class UsernamePasswordInput {
  @Field()
  email: string
  @Field()
  username: string
  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
    // user not logged in
    if (!req.session!.userId) {
      return null
    }

    const user = await em.findOne(User, { id: req.session!.userId })
    return user
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options)
    if (errors) {
      return { errors }
    }

    const hashedPassword = await argon2.hash(options.password)
    let user
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          email: options.email,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*")
      user = result[0]
    } catch (err) {
      if (err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        }
      }
    }

    // log in the user
    req.session!.userId = (user as any)!.id

    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    )
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "username or email doesn't exist",
          },
        ],
      }
    }
    const valid = await argon2.verify(user.password, password)
    if (!valid) {
      return {
        errors: [{ field: "password", message: "incorrect password" }],
      }
    }

    req.session!.userId = user.id

    return { user }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session!.destroy((err) => {
        if (err) {
          console.log(err)
          resolve(false)
          return
        }
        res.clearCookie(COOKIE_NAME)
        resolve(true)
      })
    )
  }
}
