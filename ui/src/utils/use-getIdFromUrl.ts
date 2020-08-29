import { useRouter } from "next/router"

export const useGetIdFromUrl = () => {
  const router = useRouter()
  const intId =
    typeof router.query.id === "string" ? Number(router.query.id) : -1
  return intId
}
