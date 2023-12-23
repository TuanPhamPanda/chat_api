import { User } from '@/models'
import { Response, internalSeverDatabase, responseFindDatabase } from '@/constants'

class UserService {
    public getAllUsers(): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const usersData = await User.findAll({
                    attributes: ['id', 'email', 'name', 'picture', 'given_name', 'family_name'],
                    order: [['createdAt', 'DESC']]
                })

                return resolve(responseFindDatabase({ err: 0, response: { users: usersData } }))
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }
}

export default new UserService()
