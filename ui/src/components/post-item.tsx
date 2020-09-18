import { Box, Button, Flex, Heading, Icon, Link, Text } from "@chakra-ui/core"
import NextLink from "next/link"
import React, { useState } from "react"
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql"
import { EditDeletePostButtons } from "./edit-delete-post-buttons"

interface PostItemProps {
  post: PostSnippetFragment
}

export const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading")

  const [_, vote] = useVoteMutation()

  return (
    <Box key={post.id} p={5} shadow="md" borderWidth="1px">
      <Flex alignItems="center">
        <Box flex={1} mr="1rem">
          <Flex direction="column" alignItems="center">
            <Button
              key="upvote-button"
              aria-label="upvote"
              onClick={async () => {
                if (post.voteStatus === 1) {
                  return
                }
                setLoadingState("upvote-loading")
                await vote({
                  value: 1,
                  postId: post.id,
                })
                setLoadingState("not-loading")
              }}
              isLoading={loadingState === "upvote-loading"}
              variantColor={post.voteStatus === 1 ? "green" : undefined}
            >
              <Icon name="chevron-up" size="2rem" />
            </Button>
            <Text>{post.points}</Text>
            <Button
              key="downvote-button"
              aria-label="downvote"
              onClick={async () => {
                if (post.voteStatus === -1) {
                  return
                }
                setLoadingState("downvote-loading")
                await vote({
                  value: -1,
                  postId: post.id,
                })
                setLoadingState("not-loading")
              }}
              isLoading={loadingState === "downvote-loading"}
              variantColor={post.voteStatus === -1 ? "red" : undefined}
            >
              <Icon name="chevron-down" size="2rem" />
            </Button>
          </Flex>
        </Box>
        <Box flex={9}>
          <NextLink href="/post/[id]" as={`/post/${post.id}`}>
            <Link>
              <Heading fontSize="xl">{post.title}</Heading>
            </Link>
          </NextLink>
          <Text>posted by: {post.creator.username}</Text>
          <Text mt={4}>{post.textSnippet}</Text>
        </Box>
        <Box flex={1}>
          <EditDeletePostButtons id={post.id} creatorId={post.creator.id} />
        </Box>
      </Flex>
    </Box>
  )
}
