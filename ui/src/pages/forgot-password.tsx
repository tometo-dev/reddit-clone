import { Box, Button } from "@chakra-ui/core"
import { Form, Formik } from "formik"
import { withUrqlClient } from "next-urql"
import React, { useState } from "react"
import { InputField } from "../components/input-field"
import { Wrapper } from "../components/wrapper"
import { useForgotPasswordMutation } from "../generated/graphql"
import { createUrqlClient } from "../utils/create-urql-client"

const ForgotPassword: React.FC<{}> = ({}) => {
  const [_, forgotPassword] = useForgotPasswordMutation()
  const [complete, setComplete] = useState(false)

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values)
          setComplete(true)
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email exists, we sent you an email with
              reset password link
            </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />

              <Button
                mt={4}
                type="submit"
                variantColor="teal"
                isLoading={isSubmitting}
              >
                forgot password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)
