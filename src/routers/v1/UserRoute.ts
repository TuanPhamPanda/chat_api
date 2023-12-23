import { Router } from 'express'
import { userController } from '@/controllers'

class UserRoute {
    private router: Router

    constructor() {
        this.router = Router()
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.get('/', userController.getAllUsers)
    }

    public get getRouter(): Router {
        return this.router
    }
}

export default new UserRoute()
