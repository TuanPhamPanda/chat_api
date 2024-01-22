import { responseFindDatabase, internalSeverDatabase, Response } from '@/constants'
import { File, Room, Message, User, RoomAttributes } from '@/models'
import { cloudinary } from '@/helpers'
import { generateFolder } from '@/utils'
import { IMessageDTO, IRoomDTO, IUserDTO } from '@/dto'
import { Op } from 'sequelize'

class RoomService {
    private async getRooms(rooms: Room[]) {
        return Promise.all(
            rooms.map(async (room) => {
                const [users, responseMessage] = await Promise.all([
                    this.getUsers(room.get('users') as string[]),
                    this.getMessagesByRoomId(room.dataValues.id, 1),
                ])
                const responseRoom: IRoomDTO = {
                    id: room.dataValues.id,
                    background: room.dataValues.background,
                    messages: responseMessage,
                    roomName: room.dataValues.roomName,
                    updatedAt: room.dataValues.updatedAt,
                    groupAvatar: room.dataValues.groupAvatar,
                    fileName: room.dataValues.fileName,
                    description: room.dataValues.description,
                    users: users,
                }

                return responseRoom
            }),
        )
    }

    private async getUsers(usersInRoom: string[]) {
        const userPromises = usersInRoom.map((u) => User.findByPk(u))

        const users = await Promise.all(userPromises)

        return users.map((user) => {
            const responseUser: IUserDTO = {
                id: user?.dataValues.id,
                familyName: user?.dataValues.family_name,
                givenName: user?.dataValues.given_name,
                name: user?.dataValues.given_name,
                picture: user?.dataValues.picture,
            }
            return responseUser
        })
    }

    public async getAllMessageByIdRoom(id: string): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const existingRoom = await Room.findByPk(id)
                if (!existingRoom) {
                    return resolve(responseFindDatabase({ err: 1, msg: 'Room not found' }))
                }
                const messages = await this.getMessagesByRoomId(id)
                return resolve(responseFindDatabase({ err: 0, response: { messages } }))
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    private async getMessagesByRoomId(roomId: string, limit?: number) {
        const messages = await Message.findAll({
            where: { idRoom: roomId },
            order: [['updatedAt', 'ASC']],
            limit,
        })

        const messagePromises = messages.map(async (message) => {
            const user = await User.findByPk(message.$idUser)
            const file = await File.findByPk(message.$idFile)

            const responseMessage: IMessageDTO = {
                id: message.dataValues.id,
                content: message.dataValues.contentMessage,
                user: {
                    familyName: user?.dataValues.family_name,
                    givenName: user?.dataValues.given_name,
                    id: user?.dataValues.id,
                    name: user?.dataValues.name,
                    picture: user?.dataValues.picture,
                },
                type: file ? 'file' : 'message',
                updatedAt: message.dataValues.updatedAt,
                idFile: file ? file.dataValues.id : undefined,
                fileSize: file ? file.dataValues.size : undefined,
                fileName: file ? file.dataValues.originalName : undefined,
            }
            return responseMessage
        })

        return Promise.all(messagePromises)
    }

    //get All Room By Id User
    public getAllRoomByIdUser(idUser: string): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findByPk(idUser)
                if (!user) {
                    return resolve(responseFindDatabase({ err: 1, msg: 'User not found' }))
                }
                const roomsByIdUser = await Room.findAll({
                    where: {
                        users: {
                            [Op.substring]: idUser,
                        },
                    },
                    order: [['updatedAt', 'DESC']],
                })
                if (roomsByIdUser.length === 0) {
                    return resolve(responseFindDatabase({ err: 0, response: { rooms: [] } }))
                }

                const rooms = await this.getRooms(roomsByIdUser)

                return resolve(responseFindDatabase({ err: 0, response: { rooms: rooms } }))
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    public getRoomById(id: string): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const existingRoom = await Room.findByPk(id)
                if (!existingRoom) {
                    return resolve(responseFindDatabase({ err: 1, msg: 'Room not found' }))
                }
                const room = await this.getRooms([existingRoom])
                return resolve(responseFindDatabase({ err: 0, response: { room: room[0] } }))
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    public createRoom(roomName: string, userId: string, description: string): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findByPk(userId)
                if (!user) {
                    return resolve(responseFindDatabase({ err: 1, msg: 'User not found' }))
                }
                const room = await Room.findOne({ where: { roomName: roomName } })
                if (room) {
                    return resolve(
                        responseFindDatabase({
                            err: 1,
                            msg: `Room name ${roomName} already exists. Please give another name`,
                        }),
                    )
                }
                const newRoom = new Room({ roomName, users: [userId], description })
                await newRoom.save()
                await cloudinary.api.create_folder(generateFolder(newRoom.dataValues.id))

                const responseUser: IUserDTO = {
                    id: user.id,
                    familyName: user.family_name,
                    givenName: user.given_name,
                    name: user.name,
                    picture: user.picture,
                }

                const responseRoom: IRoomDTO = {
                    background: '',
                    id: newRoom.dataValues.id,
                    messages: [],
                    roomName: newRoom.dataValues.roomName,
                    updatedAt: newRoom.dataValues.updatedAt,
                    groupAvatar: newRoom.dataValues.groupAvatar,
                    fileName: newRoom.dataValues.fileName,
                    description: newRoom.dataValues.description,
                    users: [responseUser],
                }

                return resolve(responseFindDatabase({ err: 0, response: { room: responseRoom } }))
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    //Invite a member to the room
    public inviteMemberRoom(roomName: string, userID: string): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const existingRoom = await Room.findOne({ where: { roomName: roomName } })

                if (!existingRoom) {
                    return resolve(responseFindDatabase({ err: 1, msg: 'Room not found' }))
                } else {
                    const user = await User.findByPk(userID)
                    if (!user) {
                        return resolve(responseFindDatabase({ err: 1, msg: 'User not found' }))
                    } else {
                        const usersInRoom = existingRoom.get('users') as string[]
                        if (usersInRoom.length > 0) {
                            if (
                                usersInRoom.some((u) => {
                                    return u === userID
                                })
                            ) {
                                return resolve(responseFindDatabase({ err: 1, msg: 'User already in room' }))
                            }

                            usersInRoom.push(userID)
                            existingRoom.$users = usersInRoom
                            const roomAttributes: RoomAttributes = {
                                id: existingRoom.$id,
                                roomName: existingRoom.$roomName,
                                users: usersInRoom,
                            }
                            const room = new Room(roomAttributes)
                            const [affectedRows] = await Room.update(room.dataValues, { where: { id: room.$id } })
                            if (affectedRows === 0) {
                                return resolve(responseFindDatabase({ err: 1, msg: 'Failed to update room' }))
                            }
                            const users = await Promise.all(
                                usersInRoom.map((u: string) => {
                                    const user = User.findByPk(u, {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    })
                                    return user
                                }),
                            )

                            return resolve(
                                responseFindDatabase({
                                    err: 0,
                                    response: { room: { ...room.dataValues, users: users } },
                                }),
                            )
                        }
                    }
                }
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    //Chase a member to the room
    public chaseMemberRoom(roomName: string, userID: string): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const existingRoom = await Room.findOne({ where: { roomName: roomName } })
                if (!existingRoom) {
                    return resolve(responseFindDatabase({ err: 1, msg: 'Room not found' }))
                } else {
                    const user = await User.findByPk(userID)
                    if (!user) {
                        return resolve(responseFindDatabase({ err: 1, msg: 'User not found' }))
                    } else {
                        let usersInRoom = existingRoom.get('users') as string[]
                        //users
                        if (usersInRoom.length > 0) {
                            if (usersInRoom[0] === userID) {
                                return resolve(
                                    responseFindDatabase({
                                        err: 1,
                                        msg: 'You are the group leader so you cannot delete yourself',
                                    }),
                                )
                            }
                            if (!usersInRoom.some((u) => u === userID)) {
                                return resolve(responseFindDatabase({ err: 1, msg: 'User not found in room' }))
                            }
                            usersInRoom = usersInRoom.filter((u) => u !== userID)
                            const roomAttributes: RoomAttributes = {
                                id: existingRoom.$id,
                                roomName: existingRoom.$roomName,
                                users: usersInRoom,
                            }
                            const room = new Room(roomAttributes)
                            const [affectedRows] = await Room.update(room.dataValues, { where: { id: room.$id } })
                            if (affectedRows === 0) {
                                return resolve(responseFindDatabase({ err: 1, msg: 'Failed to update room' }))
                            }
                            const users = await Promise.all(
                                usersInRoom.map((u: string) => {
                                    const user = User.findByPk(u, {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    })
                                    return user
                                }),
                            )
                            return resolve(
                                responseFindDatabase({
                                    err: 0,
                                    response: { room: { ...room.dataValues, users: users } },
                                }),
                            )
                        }
                    }
                }
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    public deleteRoom(id: string): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.findByPk(id)
                if (!room) {
                    return resolve(responseFindDatabase({ err: 1, msg: `Room not found with id ${id}` }))
                }

                const messages = await Message.findAll({ where: { idRoom: room.$id } })

                if (messages && messages.length > 0) {
                    await Promise.all(
                        messages.map(async (mes) => {
                            if (mes.$idFile) {
                                const file = await File.findByPk(mes.$idFile)
                                if (file) {
                                    await File.destroy({ where: { id: mes.$idFile } })
                                }
                            }
                            await Message.destroy({ where: { id: mes.$id } })
                        }),
                    )
                }
                try {
                    const folderName = generateFolder(id)
                    const { resources } = await cloudinary.api.resources({ type: 'upload', prefix: folderName })

                    //Xóa từng tệp tin
                    const deleteFilePromises = resources.map((resource: any) => {
                        return cloudinary.uploader.destroy(resource.public_id)
                    })
                    await Promise.all(deleteFilePromises)

                    //Xóa thư mục
                    await cloudinary.api.delete_folder(folderName)
                } catch (err: any) {
                    return reject(internalSeverDatabase(err.error.message))
                }

                await Room.destroy({ where: { id } })
                return resolve(responseFindDatabase({ err: 0, msg: `Deleted room with id ${id}` }))
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }
}

export default new RoomService()
