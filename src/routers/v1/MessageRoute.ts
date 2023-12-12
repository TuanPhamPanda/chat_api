import { Router } from 'express'
import { messageController } from '@/controllers'
import { upload, authorization } from '@/middlewares'

class MessageRoute {
    private router: Router

    constructor() {
        this.router = Router()
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            '/',
            upload.single('file'),
            authorization.handleAuthentication,
            authorization.checkUserInRoom,
            messageController.createMessageRoom
        )

        this.router.post('/:idRoom', authorization.handleAuthentication, messageController.getMessageRoom)
        this.router.delete(
            '/:id',
            authorization.handleAuthentication,
            authorization.checkUserInRoom,
            messageController.deleteMessage
        )
        this.router.put(
            '/:id',
            upload.single('file'),
            authorization.handleAuthentication,
            authorization.checkUserInRoom,
            messageController.updateMessage
        )
    }

    public get getRouter(): Router {
        return this.router
    }
}

export default new MessageRoute()
