import { DataTypes, Model, JSON as JSONType } from 'sequelize'
import { v4 } from 'uuid'

import sequelize from './Sequelize'

export interface RoomAttributes {
    id?: string
    roomName?: string
    users?: string[]
}

class Room extends Model {
    private id?: string
    private users?: string[]
    private roomName?: string

    private createdAt?: Date
    private updatedAt?: Date

    constructor(roomAttributes?: RoomAttributes) {
        super()
        if (roomAttributes) {
            if (!roomAttributes.id) {
                this.id = v4()
            } else {
                this.id = roomAttributes.id
            }
            this.users = roomAttributes.users
            this.roomName = roomAttributes.roomName
        }
    }

    public get $id(): string | undefined {
        return this.id
    }

    public set $id(value: string | undefined) {
        this.id = value
    }

    public get $users(): string[] | undefined {
        return this.users
    }

    public set $users(value: string[]) {
        this.users = value
    }

    public get $roomName(): string | undefined {
        return this.roomName
    }

    public set $roomName(value: string | undefined) {
        this.roomName = value
    }

    public get $createdAt(): Date | undefined {
        return this.createdAt
    }

    public set $createdAt(value: Date | undefined) {
        this.createdAt = value
    }

    public get $updatedAt(): Date | undefined {
        return this.updatedAt
    }

    public set $updatedAt(value: Date | undefined) {
        this.updatedAt = value
    }
}

Room.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        roomName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        users: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            get() {
                const rawValue = this.getDataValue('users')
                try {
                    const parsedValue: string[] = JSON.parse(rawValue)
                    return parsedValue
                } catch (error) {
                    return []
                }
            },
            set(value: string[]) {
                this.setDataValue('users', value)
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'room',
        tableName: 'rooms'
    }
)

Room.addHook('afterCreate', async (room: Room) => {
    room.dataValues.id = room.$id
})

Room.addHook('beforeValidate', async (room: Room) => {
    room.$updatedAt = new Date()
})

export default Room
