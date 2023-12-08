import sequelize from './Sequelize'
import User from './User'
import File, { FileAttributes } from './File'
import Room, { RoomAttributes } from './Room'
import Message, { MessageAttributes } from './Message'

sequelize.sync({ force: false }).then(() => {
    console.log('Database synchronized')
})

export { sequelize, User, Room, File, Message }
export type { RoomAttributes, FileAttributes, MessageAttributes }
