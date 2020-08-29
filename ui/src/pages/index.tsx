import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Link,
  Stack,
  Text,
} from "@chakra-ui/core"
import { withUrqlClient } from "next-urql"
import NextLink from "next/link"
import { useState } from "react"
import { Layout } from "../components/layout"
import { PostItem } from "../components/post-item"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/create-urql-client"

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  })

  const [{ data, fetching }] = usePostsQuery({ variables })

  return (
    <Layout>
      {fetching && !data ? (
        <Box>Loading...</Box>
      ) : !fetching && !data ? (
        <Box>Something went wrong</Box>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts?.map((post) => (
            <PostItem post={post} />
          ))}
        </Stack>
      )}
      {data ? (
        <Flex>
          <Button
            m="auto"
            my={5}
            isLoading={fetching}
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }}
            isDisabled={!data.posts.hasMore}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
