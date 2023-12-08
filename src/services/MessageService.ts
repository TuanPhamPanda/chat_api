import { internalSeverDatabase, notFoundDatabase, responseFindDatabase } from '@/constants'
import { FileAttributes, Message, Room, User, File } from '@/models'

export interface CreateMessageAttributesService {
    type: 'room' | 'person'
    roomString: string
    idUser: string
    contentMessage?: string
    fileAttributes?: FileAttributes
    usersString?: string[]
}

class MessageService {
    createMessage({
        type,
        roomString,
        contentMessage,
        fileAttributes,
        usersString,
        idUser
    }: CreateMessageAttributesService) {
        return new Promise(async (resolve, reject) => {
            try {
                switch (type) {
                    case 'room':
                        {
                            const user = await User.findByPk(idUser)

                            if (!user) {
                                return resolve(notFoundDatabase('user', idUser))
                            }

                            const room = await Room.findOne({ where: { roomName: roomString } })
                            if (!room) {
                                return resolve(
                                    responseFindDatabase({
                                        err: 1,
                                        msg: `Room not found with name ${roomString}`
                                    })
                                )
                            }
                            let message: Message
                            if (fileAttributes) {
                                const file = new File(fileAttributes)
                                await file.save()
                                if (file) {
                                    message = new Message({
                                        idFile: file.$id,
                                        contentMessage: file.$originalName,
                                        idRoom: room.$id,
                                        idUser: idUser
                                    })
                                    await message.save()
                                    return resolve(responseFindDatabase({ err: 0, response: { message, room } }))
                                }
                            } else {
                                message = new Message({
                                    idRoom: room.$id,
                                    contentMessage: contentMessage,
                                    idUser: idUser
                                })
                                await message.save()
                                return resolve(responseFindDatabase({ err: 0, response: { message, room } }))
                            }
                        }
                        break
                    case 'person':
                        {
                            if (usersString && usersString.length === 2) {
                                const users = await Promise.all(
                                    usersString.map(async (userString: string) => {
                                        const u = await User.findByPk(userString)
                                        return u
                                    })
                                )

                                if (!users.some((u) => u === null)) {
                                    const room = await Room.findOne({ where: { roomName: '', users: users } })
                                    if (!room) {
                                        return resolve(
                                            responseFindDatabase({
                                                err: 1,
                                                msg: `Room not found with users: ${usersString}`
                                            })
                                        )
                                    } else {
                                        let message: Message
                                        if (fileAttributes) {
                                            const file = new File(fileAttributes)
                                            await file.save()
                                            if (file) {
                                                message = new Message({
                                                    idFile: file.$id,
                                                    contentMessage: file.$originalName,
                                                    idRoom: room.$id,
                                                    idUser: idUser
                                                })
                                                await message.save()
                                                return resolve(
                                                    responseFindDatabase({ err: 0, response: { message, room } })
                                                )
                                            }
                                        } else {
                                            message = new Message({
                                                idRoom: room.$id,
                                                contentMessage: contentMessage,
                                                idUser: idUser
                                            })
                                            await message.save()
                                            return resolve(
                                                responseFindDatabase({ err: 0, response: { message, room } })
                                            )
                                        }
                                    }
                                }
                            }
                        }
                        break
                }
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    getMessages(roomString?: string, usersString?: []) {
        return new Promise(async (resolve, reject) => {
            try {
                if (roomString) {
                    const room = await Room.findOne({ where: { roomName: roomString } })
                    if (!room) {
                        return resolve(
                            responseFindDatabase({
                                err: 1,
                                msg: `Room not found with name ${roomString}`
                            })
                        )
                    }
                    const messages = await Message.findAll({
                        where: { idRoom: room.$id },
                        attributes: { exclude: ['idFile', 'idRoom', 'createdAt'] },
                        include: [
                            {
                                model: File,
                                as: 'file',
                                attributes: ['id', 'fileName', 'path', 'originalName']
                            },
                            {
                                model: Room,
                                as: 'room',
                                attributes: ['id', 'roomName', 'users']
                            }
                        ]
                    })
                    return resolve(responseFindDatabase({ err: 0, response: { messages } }))
                } else {
                    if (usersString && usersString.length > 0 && usersString.length < 2) {
                        const users = await Promise.all(
                            usersString.map(async (userString: string) => {
                                const u = await User.findByPk(userString)
                                return u
                            })
                        )
                        if (!users.some((u) => u === null)) {
                            return resolve(
                                responseFindDatabase({
                                    err: 1,
                                    msg: `Could not find one of the 2 id ${users[0]}, ${users[1]} in the user table`
                                })
                            )
                        }

                        if (!users.some((u) => u === null)) {
                            const room = await Room.findOne({ where: { roomName: '', users: users } })
                            if (!room) {
                                return resolve(
                                    responseFindDatabase({
                                        err: 1,
                                        msg: `Room not found with users: ${usersString}`
                                    })
                                )
                            }

                            const messages = await Message.findAll({
                                where: { idRoom: room.$id },
                                attributes: { exclude: ['idFile', 'idRoom', 'createAt'] },
                                include: [
                                    {
                                        model: File,
                                        as: 'file',
                                        attributes: ['id', 'fileName', 'path', 'originalName']
                                    },
                                    {
                                        model: Room,
                                        as: 'room',
                                        attributes: ['id', 'roomName', 'users']
                                    }
                                ]
                            })
                            return resolve(responseFindDatabase({ err: 0, response: { messages } }))
                        }
                    }
                }
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    updateMessage(
        type: 'room' | 'person',
        roomString: string,
        messageId: string,
        contentMessage: string,
        usersString?: string[]
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                //query room with 2 id
                switch (type) {
                    case 'room': {
                        const room = await Room.findByPk(roomString)
                        if (!room) {
                            return resolve(
                                responseFindDatabase({
                                    err: 1,
                                    msg: `Room not found with name ${roomString}`
                                })
                            )
                        } else {
                            const message = await Message.findOne({ where: { idRoom: room.$id } })
                            if (!message) {
                                return resolve(
                                    responseFindDatabase({
                                        err: 1,
                                        msg: `Message not found with message id: ${messageId}`
                                    })
                                )
                            } else {
                                await message.update({ contentMessage: contentMessage })
                                return resolve(responseFindDatabase({ err: 0, response: message }))
                            }
                        }
                    }
                    case 'person':
                        {
                            if (usersString && usersString.length > 0 && usersString.length < 2) {
                                const users = await Promise.all(
                                    usersString.map(async (userString: string) => {
                                        const u = await User.findByPk(userString)
                                        return u
                                    })
                                )
                                if (!users.some((u) => u === null)) {
                                    return resolve(
                                        responseFindDatabase({
                                            err: 1,
                                            msg: `Could not find one of the 2 id ${users[0]}, ${users[1]} in the user table`
                                        })
                                    )
                                }
                                const room = await Room.findOne({ where: { roomName: '', users: users } })
                                if (!room) {
                                    return resolve(
                                        responseFindDatabase({
                                            err: 1,
                                            msg: `Room not found with users: ${usersString}`
                                        })
                                    )
                                } else {
                                    const message = await Message.findOne({
                                        where: { idRoom: room.$id, id: messageId }
                                    })
                                    if (!message) {
                                        return resolve(
                                            responseFindDatabase({
                                                err: 1,
                                                msg: `Message not found with message id: ${messageId}`
                                            })
                                        )
                                    } else {
                                        await message.update({ contentMessage: contentMessage })
                                        return resolve(responseFindDatabase({ err: 0, response: message }))
                                    }
                                }
                            }
                        }
                        break
                }
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    deleteMessage(idMessage: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const existingMessage = await Message.findByPk(idMessage)
                if (!existingMessage) {
                    return resolve(
                        responseFindDatabase({
                            err: 1,
                            msg: `Message not found with message id: ${idMessage}`
                        })
                    )
                } else {
                    const room = await Room.findByPk(existingMessage.$idRoom)
                    if (!room) {
                        return resolve(
                            responseFindDatabase({
                                err: 1,
                                msg: `Room not found with room id: ${existingMessage.$idRoom}`
                            })
                        )
                    } else {
                        if (existingMessage.$idFile) {
                            const file = await File.findByPk(existingMessage.$idFile)
                            if (file) {
                                //delete to cloundinary
                                await file.destroy()
                            }
                        }
                        await existingMessage.destroy()

                        return resolve(
                            responseFindDatabase({ err: 0, msg: `Deleted message with id ${idMessage} successfully` })
                        )
                    }
                }
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }
}

export default new MessageService()
