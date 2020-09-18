import { Box, Heading, Text } from "@chakra-ui/core"
import { withUrqlClient } from "next-urql"
import React from "react"
import { EditDeletePostButtons } from "../../components/edit-delete-post-buttons"
import { Layout } from "../../components/layout"
import { createUrqlClient } from "../../utils/create-urql-client"
import { useGetPostFromUrl } from "../../utils/use-getPostFromUrl"

const Post = ({}) => {
  const [{ data, fetching }] = useGetPostFromUrl()

  // console.log({ data })

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
      <EditDeletePostButtons
        id={data.post.id}
        creatorId={data.post.creator.id}
      />
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)
