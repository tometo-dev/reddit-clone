import { usePostQuery } from "../generated/graphql"
import { useGetIdFromUrl } from "./use-getIdFromUrl"

export const useGetPostFromUrl = () => {
  const id = useGetIdFromUrl()
  return usePostQuery({
    pause: id === -1,
    variables: {
      id,
    },
  })
}
