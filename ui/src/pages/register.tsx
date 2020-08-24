import { Box, Button } from "@chakra-ui/core"
import { Form, Formik } from "formik"
import React from "react"
import { useMutation } from "urql"
import { InputField } from "../components/input-field"
import { Wrapper } from "../components/wrapper"

interface RegisterProps {}

const REGISTER_MUTATION = `
mutation Register($username: String!, $password: String!){
  register(options: {username: $username, password: $password}) {
    errors {
      field
      message
    }
    user {
      createdAt
      id
      username
    }
  }
}
`

const Register: React.FC<RegisterProps> = ({}) => {
  const [, register] = useMutation(REGISTER_MUTATION)

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          return register(values)
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default Register
