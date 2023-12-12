import { Router } from 'express'
import { roomController } from '@/controllers'

class RoomRoute {
    private router: Router

    constructor() {
        this.router = Router()
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.get('/user/:idUser', roomController.getRoomsByIdUser)
        this.router.post('/create-room', roomController.createRoom)
        this.router.put('/invite-member-room', roomController.inviteMemberRoom)
        this.router.put('/chase-member-room', roomController.chaseMemberRoom)
        this.router.delete('/:id', roomController.deleteRoom)
        this.router.get('/:id', roomController.getRoomById)
    }

    public get getRouter(): Router {
        return this.router
    }
}

export default new RoomRoute()
