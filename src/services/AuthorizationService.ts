import { User } from '@/models'
import { Response, internalSeverDatabase, responseFindDatabase } from '@/constants'

class AuthorizationService {
    public signInGoogle(user: User): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const userData = await User.findOne({ where: { sub: user.sub } })
                if (!userData) {
                    await user.save()
                }
                return resolve(
                    responseFindDatabase({ err: 0, response: { user: userData ? userData.dataValues : user } })
                )
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }
}

export default new AuthorizationService()
