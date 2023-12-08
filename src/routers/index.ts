import { Router } from 'express'
import ChatV1Route from './v1'

class ChatRouter {
    private router: Router
    private chatV1Route: ChatV1Route

    constructor() {
        this.router = Router()
        this.chatV1Route = new ChatV1Route()
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.use('/v1', this.chatV1Route.getRouter)
    }

    public get getRouter(): Router {
        return this.router
    }
}

export default new ChatRouter()
