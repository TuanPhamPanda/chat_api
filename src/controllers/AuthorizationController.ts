import { Response, Request } from 'express'

import { internalServer } from '@/middlewares'
import { User } from '@/models'
import { authorizationService } from '@/services'

class AuthorizationController {
    public async signInGoogle(request: Request, response: Response) {
        try {
            const user = await authorizationService.signInGoogle(new User(request.body))
            return response.status(200).json(user)
        } catch (error) {
            return internalServer(response, JSON.stringify(error))
        }
    }
}

export default new AuthorizationController()
