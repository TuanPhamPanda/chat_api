import { User } from '@/models'
import { internalSeverDatabase, responseFindDatabase } from '@/constants'

class AuthorizationService {
    public signInGoogle(user: User) {
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
                console.log(error)

                return reject(internalSeverDatabase(error))
            }
        })
    }
}

export default new AuthorizationService()
