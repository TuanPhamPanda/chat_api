import { Router } from 'express'
import { messageController } from '@/controllers'
import { upload } from '@/middlewares'

class MessageRoute {
    private router: Router

    constructor() {
        this.router = Router()
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post('/', upload.single('file'), messageController.createMessage)
    }

    public get getRouter(): Router {
        return this.router
    }
}

export default new MessageRoute()
