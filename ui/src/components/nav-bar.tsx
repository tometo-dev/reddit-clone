import { Box, Button, Flex, Heading, Link } from "@chakra-ui/core"
import NextLink from "next/link"
import { useRouter } from "next/router"
import React from "react"
import { useLogoutMutation, useMeQuery } from "../generated/graphql"

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter()
  const [{ data, fetching }] = useMeQuery()
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()

  let body

  if (fetching) {
    // data is loading
  } else if (!data?.me) {
    // user not logged in
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    )
  } else {
    // user logged in
    body = (
      <Flex>
        <Box>{data.me.username}</Box>
        <Button
          variant="link"
          ml={2}
          onClick={async () => {
            await logout()
            router.reload()
          }}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    )
  }

  return (
    <Flex
      position="sticky"
      top={0}
      zIndex={1}
      bg="lightblue"
      p={4}
      alignItems="center"
    >
      <NextLink href="/">
        <Link>
          <Heading>Reddit Clone</Heading>
        </Link>
      </NextLink>
      <Box ml="auto">
        <Flex>
          <NextLink href="/create-post">
            <Link mr={2}>create post</Link>
          </NextLink>
          {body}
        </Flex>
      </Box>
    </Flex>
  )
}
