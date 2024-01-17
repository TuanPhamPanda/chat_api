import { Request, Response } from 'express'
import joi from 'joi'
import { badRequest, internalServer } from '@/middlewares'
import { roomService } from '@/services'
import { Response as ResponseData } from '@/constants'
class RoomController {
    //create room
    public async createRoom(request: Request, response: Response) {
        try {
            const { error, value } = joi
                .object<{ roomName: string; userId: string; description: string }>({
                    roomName: joi.string().required(),
                    description: joi.string().required(),
                    userId: joi.string().uuid({ version: 'uuidv4' }).required()
                })
                .validate(request.body)

            if (error) return badRequest(response, error.details[0].message)
            const room: ResponseData = await roomService.createRoom(value.roomName, value.userId, value.description)
            return response.status(room.err ? 400 : 201).json(room)
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
                    userId: joi.string().uuid({ version: 'uuidv4' }).required()
                })
                .validate(request.body)

            if (error) return badRequest(response, error.details[0].message)
            const room: ResponseData = await roomService.inviteMemberRoom(value.roomName, value.userId)
            return response.status(room.err ? 400 : 201).json(room)
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
                    userId: joi.string().uuid({ version: 'uuidv4' }).required()
                })
                .validate(request.body)

            if (error) return badRequest(response, error.details[0].message)
            const room: ResponseData = await roomService.chaseMemberRoom(value.roomName, value.userId)
            return response.status(room.err ? 400 : 201).json(room)
        } catch (error) {
            return internalServer(response, error)
        }
    }

    //get all room includes for a user
    public async getRoomsByIdUser(request: Request, response: Response) {
        try {
            const { error, value } = joi
                .object<{ idUser: string }>({ idUser: joi.string().uuid({ version: 'uuidv4' }).required() })
                .validate(request.params)
            if (error) {
                return badRequest(response, error.details[0].message)
            }
            const rooms: ResponseData = await roomService.getAllRoomByIdUser(value.idUser)
            return response.status(rooms.err ? 400 : 200).json(rooms)
        } catch (error) {
            return internalServer(response, error)
        }
    }

    //deleteRoom
    public async deleteRoom(request: Request, response: Response) {
        try {
            const { error, value } = joi
                .object<{ id: string }>({
                    id: joi.string().uuid({ version: 'uuidv4' }).required()
                })
                .validate(request.params)

            if (error) return badRequest(response, error.details[0].message)
            const room: ResponseData = await roomService.deleteRoom(value.id)
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
                    id: joi.string().uuid({ version: 'uuidv4' }).required()
                })
                .validate(request.params)

            if (error) return badRequest(response, error.details[0].message)
            const room: ResponseData = await roomService.getRoomById(value.id)
            return response.status(room.err ? 400 : 200).json(room)
        } catch (error) {
            return internalServer(response, error)
        }
    }

    //Change background in room
}
export default new RoomController()
