import { Request, Response } from 'express'
import joi from 'joi'

import { internalServer, badRequest, upload } from '@/middlewares'
import { FileAttributes, MessageAttributes } from '@/models'
import { Response as ResponseData } from '@/constants'
import { messageService, CreateMessageAttributesService, UpdateMessageAttributesService, roomService } from '@/services'
import { cloudinary } from '@/helpers'

class MessageController {
    public async createMessageRoom(request: Request, response: Response) {
        try {
            let file: FileAttributes | undefined
            if (request.file) {
                file = {
                    fileName: request.file.filename,
                    path: request.file.path,
                    originalName: request.file.originalname,
                    size: request.file.size
                }
            }

            const messageSchema = joi.object<CreateMessageAttributesService>({
                type: joi.string().valid('message', 'file').required(),
                contentMessage: joi.string().required(),
                idRoom: joi.string().uuid({ version: 'uuidv4' }).required(),
                idUser: joi.string().uuid({ version: 'uuidv4' }).required(),
                fileAttributes: joi
                    .object<FileAttributes>({
                        fileName: joi.string().required(),
                        path: joi.string().uri().required(),
                        originalName: joi.string().required(),
                        size: joi.number().required()
                    })
                    .optional()
            })

            if (file) {
                const { error, value } = messageSchema.validate({
                    ...request.body,
                    idUser: (request as any).idUser,
                    type: 'file',
                    fileAttributes: file
                })
                if (error) {
                    await cloudinary.uploader.destroy(file.fileName)
                    return badRequest(response, error.details[0].message)
                }
                value.contentMessage = file.path
                const message: ResponseData = await messageService.createMessage(value)
                return response.status(message.err ? 400 : 201).json(message)
            } else {
                const { error, value } = messageSchema.validate({
                    ...request.body,
                    type: 'message',
                    idUser: (request as any).idUser
                })
                if (error) {
                    return badRequest(response, error.details[0].message)
                }
                const message: ResponseData = await messageService.createMessage(value)
                if (message.err) {
                    if (value.type === 'file' && value.fileAttributes) {
                        await cloudinary.uploader.destroy(value.fileAttributes.fileName)
                    }
                }
                return response.status(message.err ? 400 : 201).json(message)
            }
        } catch (err) {
            if (request.file) {
                await cloudinary.uploader.destroy(request.file.filename)
            }
            return internalServer(response, err)
        }
    }

    public async getAllMessageByIdRoom(request: Request, response: Response) {
        try {
            const { error, value } = joi.string().uuid({ version: 'uuidv4' }).validate(request.params.idRoom)
            if (error) return badRequest(response, error.details[0].message)
            const messages: ResponseData = await roomService.getAllMessageByIdRoom(value)
            return response.status(messages.err ? 400 : 200).json(messages)
        } catch (error) {
            return internalServer(response, error)
        }
    }

    // public async getMessageByIdRoom(request: Request, response: Response) {
    //     try {
    //         const { error, value } = joi
    //             .object<{ idRoom: string }>({
    //                 idRoom: joi.string().uuid({ version: 'uuidv4' }).required()
    //             })
    //             .validate({ idRoom: request.params?.idRoom, idUser: (request as any).idUser })
    //         if (error) {
    //             return badRequest(response, error.details[0].message)
    //         }
    //         const responseData: ResponseData = await roomService.getAllMessageByIdRoom(value.idRoom)
    //         return response.status(responseData.err ? 400 : 201).json(responseData)
    //     } catch (err) {
    //         return internalServer(response, err)
    //     }
    // }

    public async updateMessage(request: Request, response: Response) {
        try {
            let file: FileAttributes | undefined
            if (request.file) {
                file = {
                    fileName: request.file.filename,
                    path: request.file.path,
                    originalName: request.file.originalname,
                    id: request.body?.idFile,
                    size: request.file.size
                }
            }

            const messageSchema = joi.object<UpdateMessageAttributesService>({
                type: joi.string().valid('message', 'file').required(),
                contentMessage: joi.string().required(),
                idRoom: joi.string().uuid({ version: 'uuidv4' }).required(),
                idUser: joi.string().uuid({ version: 'uuidv4' }).required(),
                idMessage: joi.string().uuid({ version: 'uuidv4' }).required(),
                fileAttributes: joi
                    .object<FileAttributes>({
                        fileName: joi.string().required(),
                        path: joi.string().uri().required(),
                        originalName: joi.string().required(),
                        id: joi.string().uuid({ version: 'uuidv4' }).required(),
                        size: joi.number().required()
                    })
                    .optional()
            })

            if (file) {
                if (request.body.idFile) {
                    delete request.body.idFile
                }
                const { error, value } = messageSchema.validate({
                    ...request.body,
                    idUser: (request as any).idUser,
                    type: 'file',
                    fileAttributes: file,
                    idMessage: request.params.id
                })
                if (error) {
                    await cloudinary.uploader.destroy(file.fileName)

                    if (error.details[0].message.includes('fileAttributes.id')) {
                        return badRequest(response, error.details[0].message.replace('fileAttributes.id', 'idFIle'))
                    }

                    return badRequest(response, error.details[0].message)
                }
                value.contentMessage = file.path
                const message: ResponseData = await messageService.updateMessage(value)
                if (message.err) {
                    if (value.type === 'file' && value.fileAttributes) {
                        await cloudinary.uploader.destroy(value.fileAttributes.fileName)
                    }
                }
                return response.status(message.err ? 400 : 201).json(message)
            } else {
                const { error, value } = messageSchema.validate({
                    ...request.body,
                    type: 'message',
                    idUser: (request as any).idUser,
                    idMessage: request.params.id
                })
                if (error) {
                    return badRequest(response, error.details[0].message)
                }
                const message: ResponseData = await messageService.updateMessage(value)
                return response.status(message.err ? 400 : 201).json(message)
            }
        } catch (err) {
            if (request.file) {
                await cloudinary.uploader.destroy(request.file.filename)
            }
            return internalServer(response, err)
        }
    }

    public async deleteMessage(request: Request, response: Response) {
        try {
            const { error, value } = joi
                .string()
                .uuid({ version: 'uuidv4' })
                .required()
                .validate(request.params?.id)
            if (error) {
                return badRequest(response, error.details[0].message)
            }
            const message: ResponseData = await messageService.deleteMessage(value)
            return response.status(message.err ? 400 : 200).json(message)
        } catch (err) {
            return internalServer(response, err)
        }
    }
}

export default new MessageController()
