import { internalSeverDatabase, notFoundDatabase, responseFindDatabase, Response } from '@/constants'
import { cloudinary } from '@/helpers'
import { FileAttributes, Message, Room, User, File } from '@/models'

export interface CreateMessageAttributesService {
    idRoom: string
    idUser: string
    contentMessage: string
    type: 'message' | 'file'
    fileAttributes?: FileAttributes
}

export interface UpdateMessageAttributesService extends CreateMessageAttributesService {
    idMessage: string
}

class MessageService {
    public updateMessage({
        type,
        idRoom,
        idUser,
        contentMessage,
        idMessage,
        fileAttributes,
    }: UpdateMessageAttributesService): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.findByPk(idRoom, { attributes: { include: ['id', 'roomName', 'users'] } })
                const user = await User.findByPk(idUser, {
                    attributes: {
                        include: ['id', 'name', 'given_name', 'family_name', 'picture', 'createdAt'],
                        exclude: [
                            'iss',
                            'nbf',
                            'aud',
                            'email',
                            'azp',
                            'iat',
                            'exp',
                            'jti',
                            'updatedAt',
                            'sub',
                            'email_verified',
                        ],
                    },
                })
                const message = await Message.findByPk(idMessage)
                if (!message) {
                    return resolve(responseFindDatabase({ err: 1, msg: 'Message not found' }))
                }

                switch (type) {
                    case 'message': {
                        if (message.$idFile) {
                            return resolve(
                                responseFindDatabase({ err: 1, msg: 'Files cannot be edited using messages' }),
                            )
                        }

                        const [affectedRows] = await Message.update(
                            { contentMessage: contentMessage, id: message.$id },
                            { where: { id: message.$id } },
                        )
                        if (affectedRows === 0) {
                            return resolve(responseFindDatabase({ err: 1, msg: 'Failed to update message' }))
                        }

                        const messageResponse = {
                            message: message.dataValues,
                            user: user?.dataValues,
                            room: room?.dataValues,
                        }

                        return resolve(
                            responseFindDatabase({
                                err: 0,
                                response: { message: { messageResponse } },
                            }),
                        )
                    }
                    case 'file': {
                        const file = await File.findByPk(fileAttributes?.id)
                        if (!file) {
                            return resolve(responseFindDatabase({ err: 1, msg: 'File not found' }))
                        }

                        await cloudinary.uploader.destroy(file.$fileName)

                        const [affectedRowsFile] = await File.update(
                            { ...fileAttributes },
                            {
                                where: { id: fileAttributes?.id },
                            },
                        )
                        const [affectedRowsMessage] = await Message.update(
                            { contentMessage: contentMessage, id: message.$id },
                            { where: { id: message.$id } },
                        )
                        if (affectedRowsMessage === 0 && affectedRowsFile === 0) {
                            return resolve(responseFindDatabase({ err: 1, msg: 'Failed to update message or file' }))
                        }

                        const messageResponse = {
                            message: message.dataValues,
                            room: room?.dataValues,
                            file: file.dataValues,
                            user: user?.dataValues,
                        }

                        return resolve(
                            responseFindDatabase({
                                err: 0,
                                response: { message: messageResponse },
                            }),
                        )
                    }
                }
            } catch (error) {
                reject(internalSeverDatabase(JSON.stringify(error)))
            }
        })
    }

    public createMessage({
        type,
        idRoom,
        idUser,
        contentMessage,
        fileAttributes,
    }: CreateMessageAttributesService): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.findByPk(idRoom, { attributes: { include: ['id', 'roomName', 'users'] } })
                if (!room) {
                    return resolve(notFoundDatabase('room', idRoom))
                }

                const user = await User.findByPk(idUser, {
                    attributes: {
                        include: ['id', 'name', 'given_name', 'family_name', 'picture', 'createdAt'],
                        exclude: [
                            'iss',
                            'nbf',
                            'aud',
                            'email',
                            'azp',
                            'iat',
                            'exp',
                            'jti',
                            'updatedAt',
                            'sub',
                            'email_verified',
                        ],
                    },
                })

                switch (type) {
                    case 'file': {
                        const file = new File(fileAttributes)
                        await file.save()

                        const idFile = file.$id
                        const newMessage = new Message({ idUser, contentMessage, idRoom, idFile })
                        await newMessage.save()
                        const message = {
                            room,
                            file,
                            user,
                        }
                        return resolve(responseFindDatabase({ err: 0, response: { message: message } }))
                    }
                    case 'message': {
                        const newMessage = new Message({ idUser, contentMessage, idRoom })
                        await newMessage.save()
                        const message = {
                            message: newMessage,
                            user: user,
                            room: room,
                        }

                        return resolve(responseFindDatabase({ err: 0, response: { message: message } }))
                    }
                }
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    public getMessagesByIdRoom({ idRoom, idUser }: { idRoom: string; idUser: string }): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.findByPk(idRoom, { attributes: { include: ['id', 'roomName', 'users'] } })
                if (!room) {
                    return resolve(notFoundDatabase('room', idRoom))
                }
                if (!room.$users?.some((u) => u.includes(idUser))) {
                    return resolve(responseFindDatabase({ err: 1, msg: 'User not found in room' }))
                }
                const messages = await Message.findAll({
                    where: { idRoom: idRoom },
                    attributes: {
                        exclude: ['idRoom', 'idFile', 'idUser'],
                        include: ['id', 'contentMessage', 'updatedAt'],
                    },
                    order: [['updatedAt', 'DESC']],
                    include: [
                        {
                            model: File,
                            as: 'file',
                            attributes: ['id', 'fileName', 'path', 'originalName'],
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: {
                                include: ['id', 'name', 'given_name', 'family_name', 'picture', 'createdAt'],
                                exclude: [
                                    'iss',
                                    'nbf',
                                    'aud',
                                    'email',
                                    'azp',
                                    'iat',
                                    'exp',
                                    'jti',
                                    'updatedAt',
                                    'sub',
                                    'email_verified',
                                ],
                            },
                        },
                        {
                            model: Room,
                            as: 'room',
                            attributes: { include: ['id', 'roomName', 'users'] },
                        },
                    ],
                })

                return resolve(responseFindDatabase({ err: 0, response: { messages: messages } }))
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    /*
    public deleteMessage(id: string): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const message = await Message.findByPk(id)
                if (!message) {
                    return resolve(notFoundDatabase('message', id))
                }
                const idFile = message.$idFile
                if (idFile) {
                    const file = await File.findByPk(idFile)
                    if (!file) {
                        return resolve(notFoundDatabase('file', idFile))
                    }
                    await cloudinary.uploader.destroy(file.$fileName)
                    await file.destroy()
                }
                await message.destroy()
                return resolve(responseFindDatabase({ err: 0, msg: 'Deleted message successfully!' }))
            } catch (error) {
                return reject(internalSeverDatabase(JSON.stringify(error)))
            }
        })
    }
    */

    public async deleteMessage(id: string): Promise<Response> {
        try {
            const message = await Message.findByPk(id)

            if (!message) {
                return notFoundDatabase('message', id)
            }

            const idFile = message.$idFile
            const tasks: Promise<void>[] = []

            if (idFile) {
                tasks.push(
                    (async () => {
                        const file = await File.findByPk(idFile)

                        if (file) {
                            await cloudinary.uploader.destroy(file.$fileName)
                            await file.destroy()
                        } else {
                            throw notFoundDatabase('file', idFile)
                        }
                    })(),
                )
            }

            await Promise.all(tasks)

            await message.destroy()
            return responseFindDatabase({ err: 0, msg: 'Deleted message successfully!' })
        } catch (error) {
            return internalSeverDatabase(JSON.stringify(error))
        }
    }
}

export default new MessageService()
