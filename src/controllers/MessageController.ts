import { internalServer, badRequest, upload } from '@/middlewares'
import { FileAttributes, MessageAttributes } from '@/models'
import { Request, Response } from 'express'
import joi from 'joi'
import { messageService, CreateMessageAttributesService } from '@/services'
import { cloudinary } from '@/helpers'

class MessageController {
    public async createMessage(request: Request, response: Response) {
        try {
            let file: FileAttributes | undefined

            if (request.file) {
                file = {
                    fileName: request.file.originalname,
                    path: request.file.path,
                    originalName: request.file.originalname
                }
            }

            const validateData = joi.object<CreateMessageAttributesService>({
                type: joi.string().valid('room', 'person').required(),
                roomString: joi.when('type', {
                    is: 'room',
                    then: joi.string().required(),
                    otherwise: joi.string().allow('')
                }),
                usersString: joi.when('type', {
                    is: 'room',
                    then: joi.array().items(joi.string()).optional(),
                    otherwise: joi.array().items(joi.string()).length(2).required()
                }),
                contentMessage: joi.string().optional(),
                fileAttributes: joi
                    .object<FileAttributes>({
                        fileName: joi.string().required(),
                        path: joi.string().uri().required(),
                        originalName: joi.string().required()
                    })
                    .optional()
                    .xor('contentMessage'),
                idUser: joi.string().required()
            })
            if (file) {
                const { error, value } = validateData.validate({ ...request.body, file: file })

                if (error) {
                    await cloudinary.uploader.destroy(file.fileName)
                    return badRequest(response, error.details[0].message)
                }

                const createdMessage = await messageService.createMessage(value)
                return response.status(201).json(createdMessage)
            } else {
                const { error, value } = validateData.validate(request.body)
                if (error) {
                    return badRequest(response, error.details[0].message)
                }
                const createdMessage = await messageService.createMessage(value)
                return response.status(201).json(createdMessage)
            }
        } catch (error) {
            if (request.file) {
                await cloudinary.uploader.destroy(request.file.filename)
            }
            return internalServer(response, error)
        }
    }
}

export default new MessageController()
