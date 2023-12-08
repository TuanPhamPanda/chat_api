import { Response, Request } from 'express'

import { internalServer } from '@/middlewares'
import { User } from '@/models'
import { authorizationService } from '@/services'

class AuthorizationController {
    public async signInGoogle(request: Request, response: Response) {
        try {
            const user = await authorizationService.signInGoogle(new User(request.body))
            return response.status(201).json(user)
        } catch (error) {
            console.log(error)

            return internalServer(response, error)
        }
    }
}

export default new AuthorizationController()
