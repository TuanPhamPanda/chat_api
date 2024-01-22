import { Request, Response, NextFunction } from 'express'
import joi from 'joi'
import { badRequest, internalServer } from './HandleErrorServer'
import { Room, User } from '@/models'
import { cloudinary } from '@/helpers'

class Authorization {
    public async checkUserInRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { error, value } = joi
                .object<{ idRoom: string; idUser: string }>({
                    idRoom: joi.string().uuid({ version: 'uuidv4' }).required(),
                    idUser: joi.string().uuid({ version: 'uuidv4' }).required(),
                })
                .validate({ idRoom: req.body?.idRoom, idUser: (req as any).idUser })

            if (error) {
                if (req.file) {
                    await cloudinary.uploader.destroy(req.file.filename)
                }
                return badRequest(res, error.details[0].message)
            }
            const room = await Room.findByPk(value.idRoom)
            if (!room) {
                if (req.file) {
                    await cloudinary.uploader.destroy(req.file.filename)
                }
                return badRequest(res, 'Room not found')
            }
            if (!room.$users?.some((u) => u.includes(value.idUser))) {
                if (req.file) {
                    await cloudinary.uploader.destroy(req.file.filename)
                }
                return badRequest(res, 'User not found in room')
            }
            next()
        } catch (error) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename)
            }
            return internalServer(res, error)
        }
    }

    public async handleAuthentication(request: Request, response: Response, next: NextFunction) {
        try {
            const { error, value } = joi.string().uuid({ version: 'uuidv4' }).required().validate(request.body?.idUser)
            if (error) {
                if (request.file) {
                    cloudinary.uploader.destroy(request.file.filename)
                }
                return badRequest(response, error.details[0].message.replace('value', 'idUser'))
            }

            const user = await User.findByPk(value)
            if (!user) {
                if (request.file) {
                    cloudinary.uploader.destroy(request.file.filename)
                }
                return response.sendStatus(401)
            }
            ;(request as any).idUser = user.id
            next()
        } catch (err: any) {
            if (request.file) {
                cloudinary.uploader.destroy(request.file.filename)
            }
            return internalServer(response, err)
        }
    }
}

export default new Authorization()
