import { Response, Request } from 'express'

import { internalServer } from '@/middlewares'
import { userService } from '@/services'

class UserController {
    public async getAllUsers(request: Request, response: Response) {
        try {
            const users = await userService.getAllUsers()
            return response.status(200).json(users)
        } catch (error) {
            return internalServer(response, JSON.stringify(error))
        }
    }
}

export default new UserController()
