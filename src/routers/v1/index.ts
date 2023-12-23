import { Router } from 'express'

import authorizationRoute from './AuthorizationRoute'
import messageRoute from './MessageRoute'
import roomRoute from './RoomRoute'
import userRoute from './UserRoute'

class ChatV1Route {
    private router: Router

    constructor() {
        this.router = Router()
        this.initializeRoutes()
    }
    private initializeRoutes() {
        this.router.use('/auth', authorizationRoute.getRouter)
        this.router.use('/message', messageRoute.getRouter)
        this.router.use('/room', roomRoute.getRouter)
        this.router.use('/user', userRoute.getRouter)
    }

    public get getRouter(): Router {
        return this.router
    }
}

export default ChatV1Route
