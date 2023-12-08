import { responseFindDatabase, internalSeverDatabase } from '@/constants'
import { File, Room, Message, User, RoomAttributes } from '@/models'
import { cloudinary } from '@/helpers'
import { generateFolder } from '@/utils'

class RoomService {
    private async getRooms(rooms: Room[]) {
        return Promise.all(
            rooms.map(async (room) => {
                const users = await this.getUsers(room.get('users') as string[])
                return {
                    id: room.$id,
                    roomName: room.$roomName,
                    users: users
                }
            })
        )
    }

    private async getUsers(usersInRoom: string[]) {
        return Promise.all(
            usersInRoom.map(async (u) => {
                const user = await User.findByPk(u)
                return user ? user.dataValues : null
            })
        )
    }

    public async getAllRooms() {
        try {
            const roomsAll = await Room.findAll()

            if (roomsAll.length === 0) {
                return responseFindDatabase({ err: 0, response: { rooms: [] } })
            }
            const rooms = await this.getRooms(roomsAll)
            return { err: 0, rooms: rooms }
        } catch (error: any) {
            return internalSeverDatabase(error)
        }
    }

    public getRoomById(id: string) {
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

    public createRoom(roomName: string, userId: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findByPk(userId)
                if (!user) {
                    return reject(responseFindDatabase({ err: 1, msg: 'User not found' }))
                }
                const room = await Room.findOne({ where: { roomName: roomName } })
                if (room) {
                    return resolve(
                        responseFindDatabase({
                            err: 1,
                            msg: `Room name ${roomName} already exists. Please give another name`
                        })
                    )
                }
                const newRoom = new Room({ roomName: roomName, users: [userId] })
                await newRoom.save()
                await cloudinary.api.create_folder(generateFolder(newRoom.dataValues.id))
                return resolve(responseFindDatabase({ err: 0, response: { room: newRoom.dataValues } }))
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    //Invite a member to the room
    public inviteMemberRoom(roomName: string, userID: string) {
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
                                users: usersInRoom
                            }
                            const room = new Room(roomAttributes)
                            const [affectedRows] = await Room.update(room.dataValues, { where: { id: room.$id } })
                            if (affectedRows === 0) {
                                return resolve(responseFindDatabase({ err: 1, msg: 'Failed to update room' }))
                            }
                            const users = await Promise.all(
                                usersInRoom.map((u: string) => {
                                    const user = User.findByPk(u, {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] }
                                    })
                                    return user
                                })
                            )

                            return resolve(
                                responseFindDatabase({
                                    err: 0,
                                    response: { room: { ...room.dataValues, users: users } }
                                })
                            )
                        }
                    }
                }
            } catch (error: any) {
                console.log(error)
                return reject(internalSeverDatabase(error))
            }
        })
    }

    //Chase a member to the room
    public chaseMemberRoom(roomName: string, userID: string) {
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
                                        msg: 'You are the group leader so you cannot delete yourself'
                                    })
                                )
                            }
                            if (!usersInRoom.some((u) => u === userID)) {
                                return resolve(responseFindDatabase({ err: 1, msg: 'User not found in room' }))
                            }
                            usersInRoom = usersInRoom.filter((u) => u !== userID)
                            const roomAttributes: RoomAttributes = {
                                id: existingRoom.$id,
                                roomName: existingRoom.$roomName,
                                users: usersInRoom
                            }
                            const room = new Room(roomAttributes)
                            const [affectedRows] = await Room.update(room.dataValues, { where: { id: room.$id } })
                            if (affectedRows === 0) {
                                return resolve(responseFindDatabase({ err: 1, msg: 'Failed to update room' }))
                            }
                            const users = await Promise.all(
                                usersInRoom.map((u: string) => {
                                    const user = User.findByPk(u, {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] }
                                    })
                                    return user
                                })
                            )
                            return resolve(
                                responseFindDatabase({
                                    err: 0,
                                    response: { room: { ...room.dataValues, users: users } }
                                })
                            )
                        }
                    }
                }
            } catch (error: any) {
                return reject(internalSeverDatabase(error))
            }
        })
    }

    deleteRoom(id: string) {
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
                        })
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
                    console.log(err)
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
