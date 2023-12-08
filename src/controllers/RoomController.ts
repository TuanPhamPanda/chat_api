import { badRequest, internalServer } from '@/middlewares'
import { roomService } from '@/services'
import { Request, Response } from 'express'
import joi from 'joi'
class RoomController {
    //create room
    public async createRoom(request: Request, response: Response) {
        try {
            const { error, value } = joi
                .object<{ roomName: string; userId: string }>({
                    roomName: joi.string().required(),
                    userId: joi.string().required()
                })
                .validate(request.body)

            if (error) return badRequest(response, error.details[0].message)
            const room = await roomService.createRoom(value.roomName, value.userId)
            return response.status(201).json(room)
        } catch (error) {
            return internalServer(response, error)
        }
    }

    //invite room
    public async inviteMemberRoom(request: Request, response: Response) {
        try {
            const { error, value } = joi
                .object<{ roomName: string; userId: string }>({
                    roomName: joi.string().required(),
                    userId: joi.string().required()
                })
                .validate(request.body)

            if (error) return badRequest(response, error.details[0].message)
            const room = await roomService.inviteMemberRoom(value.roomName, value.userId)
            return response.status(201).json(room)
        } catch (error) {
            return internalServer(response, error)
        }
    }

    //Chase a member to the room
    public async chaseMemberRoom(request: Request, response: Response) {
        try {
            const { error, value } = joi
                .object<{ roomName: string; userId: string }>({
                    roomName: joi.string().required(),
                    userId: joi.string().required()
                })
                .validate(request.body)

            if (error) return badRequest(response, error.details[0].message)
            const room: any = await roomService.chaseMemberRoom(value.roomName, value.userId)
            return response.status(room?.msg ? 400 : 201).json(room)
        } catch (error) {
            return internalServer(response, error)
        }
    }

    //get all room
    public async getRooms(request: Request, response: Response) {
        try {
            const rooms = await roomService.getAllRooms()
            return response.status(200).json(rooms)
        } catch (error) {
            return internalServer(response, error)
        }
    }

    //deleteRoom
    public async deleteRoom(request: Request, response: Response) {
        try {
            const { error, value } = joi
                .object<{ id: string }>({
                    id: joi.string().required()
                })
                .validate(request.params)

            if (error) return badRequest(response, error.details[0].message)
            const room: any = await roomService.deleteRoom(value.id)
            return response.status(room.err ? 400 : 200).json(room)
        } catch (error) {
            return internalServer(response, error)
        }
    }

    //get by id
    public async getRoomById(request: Request, response: Response) {
        try {
            const { error, value } = joi
                .object<{ id: string }>({
                    id: joi.string().required()
                })
                .validate(request.params)

            if (error) return badRequest(response, error.details[0].message)
            const room: any = await roomService.getRoomById(value.id)
            return response.status(room.err ? 400 : 200).json(room)
        } catch (error) {
            return internalServer(response, error)
        }
    }

    //Change background in room
}
export default new RoomController()
