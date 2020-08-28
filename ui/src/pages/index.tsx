import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core"
import { withUrqlClient } from "next-urql"
import NextLink from "next/link"
import { useState } from "react"
import { Layout } from "../components/layout"
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
      <Flex alignItems="center">
        <Heading>Reddit Clone</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">create post</Link>
        </NextLink>
      </Flex>
      <br />
      {fetching && !data ? (
        <div>Loading...</div>
      ) : !fetching && !data ? (
        <div>Something went wrong</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts?.map((post) => (
            <Box key={post.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.textSnippet}</Text>
            </Box>
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
