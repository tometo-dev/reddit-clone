import { cacheExchange, Resolver } from "@urql/exchange-graphcache"
import Router from "next/router"
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql"
import { pipe, tap } from "wonka"
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql"
import { customUpdateQuery } from "./custom-update-query"

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error) {
        if (error?.message.includes("not authenticated")) {
          Router.replace("/login")
        }
      }
    })
  )
}

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info

    const allFields = cache.inspectFields(entityKey)
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName)
    const size = fieldInfos.length

    if (size === 0) {
      return undefined
    }

    let results: string[] = []

    const isItInTheCache = cache.resolve(
      cache.resolveFieldByKey(
        entityKey,
        `${fieldName}(${stringifyVariables(fieldArgs)})`
      ) as string,
      "posts"
    )

    info.partial = !isItInTheCache

    let hasMore = true

    fieldInfos.forEach((fieldInfo) => {
      const key = cache.resolveFieldByKey(
        entityKey,
        fieldInfo.fieldKey
      ) as string
      const data = cache.resolve(key, "posts") as string[]
      const _hasMore = cache.resolve(key, "hasMore")
      if (!_hasMore) {
        hasMore = _hasMore as boolean
      }
      results.push(...data)
    })
    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    }
  }
}

export const createUrqlClient = (ssrExchange: any) => ({
  url: `http://localhost:4000/graphql`,
  fetchOptions: { credentials: "include" as const },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          login: (_result, args, cache, info) => {
            customUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query
                } else {
                  return {
                    me: result.login.user,
                  }
                }
              }
            )
          },
          register: (_result, args, cache, info) => {
            customUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query
                } else {
                  return {
                    me: result.register.user,
                  }
                }
              }
            )
          },
          logout: (_result, args, cache, info) => {
            customUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({
                me: null,
              })
            )
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
})
