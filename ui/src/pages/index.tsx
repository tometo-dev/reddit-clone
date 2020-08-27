import { Link } from "@chakra-ui/core"
import { withUrqlClient } from "next-urql"
import NextLink from "next/link"
import { Layout } from "../components/layout"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/create-urql-client"

const Index = () => {
  const [{ data }] = usePostsQuery()

  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>create post</Link>
      </NextLink>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
