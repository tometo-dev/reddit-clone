import { Box, Button } from "@chakra-ui/core"
import { Form, Formik } from "formik"
import { withUrqlClient } from "next-urql"
import { useRouter } from "next/router"
import React from "react"
import { InputField } from "../components/input-field"
import { Layout } from "../components/layout"
import { useCreatePostMutation } from "../generated/graphql"
import { createUrqlClient } from "../utils/create-urql-client"
import { useIsAuth } from "../utils/use-isAuth"

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter()
  const [_, createPost] = useCreatePostMutation()

  useIsAuth()

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ input: values })
          if (!error) {
            router.push("/")
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputField
                name="text"
                placeholder="text..."
                label="Body"
                textarea={true}
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              variantColor="teal"
              isLoading={isSubmitting}
            >
              create post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient)(CreatePost)
