import { User } from '@/models'
import { Response, internalSeverDatabase, responseFindDatabase } from '@/constants'
import { IUserDTO } from '@/dto'

class AuthorizationService {
    public signInGoogle(user: User): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const userData = await User.findOne({
                    where: { sub: user.sub }
                })
                if (!userData) {
                    await user.save()
                }

                const userResponse: IUserDTO = userData
                    ? {
                          id: userData.id,
                          name: userData.name,
                          picture: userData.picture,
                          familyName: userData.family_name,
                          givenName: userData.given_name
                      }
                    : {
                          id: user.id,
                          name: user.name,
                          picture: user.picture,
                          familyName: user.family_name,
                          givenName: user.given_name
                      }
                return resolve(responseFindDatabase({ err: 0, response: { user: userResponse } }))
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }
}

export default new AuthorizationService()
