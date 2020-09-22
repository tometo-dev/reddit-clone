import DataLoader from "dataloader"
import { User } from "../entities/User"

// given a list of userIDs, returns an array of userId-user map
// input: [1, 2, 3]
// returns: [{id: 1, ...}, {id: 2, ...}, ...]
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[])
    const userIdToUser: Record<number, User> = {}

    users.forEach((user) => {
      userIdToUser[user.id] = user
    })

    return userIds.map((userId) => userIdToUser[userId])
  })
