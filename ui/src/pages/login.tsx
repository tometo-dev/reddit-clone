import { Box, Button } from "@chakra-ui/core"
import { Form, Formik } from "formik"
import { withUrqlClient } from "next-urql"
import { useRouter } from "next/router"
import React from "react"
import { InputField } from "../components/input-field"
import { Wrapper } from "../components/wrapper"
import { useLoginMutation } from "../generated/graphql"
import { createUrqlClient } from "../utils/create-urql-client"
import { toErrorMap } from "../utils/to-error-map"

interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
  const router = useRouter()
  const [, login] = useLoginMutation()

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values)
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data?.login.user) {
            router.push("/")
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              variantColor="teal"
              isLoading={isSubmitting}
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(Login)
