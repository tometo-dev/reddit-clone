import argon2 from "argon2"
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
import { getConnection } from "typeorm"
import { v4 } from "uuid"
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants"
import { User } from "../entities/User"
import { MyContext } from "../types"
import { sendEmail } from "../utils/send-email"
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
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    // user not logged in
    if (!req.session!.userId) {
      return undefined
    }

    return User.findOne(req.session!.userId)
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options)
    if (errors) {
      return { errors }
    }

    const hashedPassword = await argon2.hash(options.password)
    let user
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPassword,
          email: options.email,
        })
        .returning("*")
        .execute()
      user = result.raw[0]
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
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

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      // email not in database
      return true
    }
    const token = v4()

    await redis.set(
      `${FORGOT_PASSWORD_PREFIX}${token}`,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ) // 3 days

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}"> reset password </a>`
    )

    return true
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      }
    }

    const redisKey = FORGOT_PASSWORD_PREFIX + token
    const userId = await redis.get(redisKey)
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      }
    }
    const userIDNum = Number(userId)
    const user = await User.findOne(userIDNum)

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      }
    }

    await User.update(
      { id: userIDNum },
      {
        password: await argon2.hash(newPassword),
      }
    )

    await redis.del(redisKey)

    // login user after change password
    req.session!.userId = user.id

    return { user }
  }
}
