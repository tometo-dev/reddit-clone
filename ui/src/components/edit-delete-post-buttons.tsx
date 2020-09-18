import { Flex, IconButton, Link } from "@chakra-ui/core"
import React from "react"
import NextLink from "next/link"
import { useDeletePostMutation, useMeQuery } from "../generated/graphql"
import { useRouter } from "next/router"

interface EditDeletePostButtonsProps {
  id: number
  creatorId: number
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [, deletePost] = useDeletePostMutation()
  const [{ data }] = useMeQuery()
  const router = useRouter()

  if (data?.me?.id !== creatorId) {
    return null
  }
  return (
    <Flex>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton icon="edit" aria-label="edit post" mr={2} as={Link} />
      </NextLink>
      <IconButton
        icon="delete"
        aria-label="delete post"
        onClick={async () => {
          await deletePost({ id })
          await router.push("/")
        }}
      />
    </Flex>
  )
}
