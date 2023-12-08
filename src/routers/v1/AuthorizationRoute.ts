import { Router } from 'express'
import { authorizationController } from '@/controllers'

class AuthorizationRoute {
    private router: Router

    constructor() {
        this.router = Router()
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post('/signup-google', authorizationController.signInGoogle)
    }

    public get getRouter(): Router {
        return this.router
    }
}

export default new AuthorizationRoute()
