import { Box, Button, Flex, Link } from "@chakra-ui/core"
import React from "react"
import NextLink from "next/link"
import { useLogoutMutation, useMeQuery } from "../generated/graphql"
import { isServer } from "../utils/is-server"

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  })
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
          onClick={() => {
            logout()
          }}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    )
  }

  return (
    <Flex position="sticky" top={0} zIndex={1} bg="lightblue" p={4}>
      <Box ml="auto">{body}</Box>
    </Flex>
  )
}
