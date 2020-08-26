import { NavBar } from "../components/nav-bar"
import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../utils/create-urql-client"
import { usePostsQuery } from "../generated/graphql"

const Index = () => {
  const [{ data }] = usePostsQuery()

  return (
    <>
      <NavBar />
      <div>Hello World</div>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
