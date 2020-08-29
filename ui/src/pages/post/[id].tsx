import { Box, Heading, Text } from "@chakra-ui/core"
import { withUrqlClient } from "next-urql"
import { useRouter } from "next/router"
import React from "react"
import { Layout } from "../../components/layout"
import { usePostQuery } from "../../generated/graphql"
import { createUrqlClient } from "../../utils/create-urql-client"

const Post = ({}) => {
  const router = useRouter()
  const intId =
    typeof router.query.id === "string" ? Number(router.query.id) : -1
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  })

  console.log({ data })

  if (fetching) {
    return (
      <Layout>
        <Box>Loading...</Box>
      </Layout>
    )
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>could not find the post</Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Heading>{data.post.title}</Heading>
      <Text>{data.post.text}</Text>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)
