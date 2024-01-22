import { DataTypes, Model } from 'sequelize'
import { v4 } from 'uuid'
import sequelize from './Sequelize'

export interface RoomAttributes {
    id?: string
    description?: string
    roomName?: string
    users?: string[]
    background?: string
    groupAvatar?: string
    fileName?: string
    createdAt?: string
    updatedAt?: string
}

class Room extends Model {
    private id?: string
    private users?: string[]
    private roomName?: string
    private background?: string
    private groupAvatar?: string
    private fileName?: string
    private description?: string

    private createdAt?: string
    private updatedAt?: string

    constructor(roomAttributes?: RoomAttributes) {
        super()
        if (roomAttributes) {
            if (!roomAttributes.id) {
                this.id = v4()
            } else {
                this.id = roomAttributes.id
            }
            this.background = roomAttributes.background
            this.users = roomAttributes.users
            this.roomName = roomAttributes.roomName
            this.groupAvatar = roomAttributes.groupAvatar
            this.fileName = roomAttributes.fileName
            this.createdAt = roomAttributes.createdAt
            this.updatedAt = roomAttributes.updatedAt
            this.description = roomAttributes.description
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

    public get $background(): string | undefined {
        return this.background
    }

    public set $background(value: string | undefined) {
        this.background = value
    }

    public get $groupAvatar() {
        return this.groupAvatar
    }

    public set $fileName(value: string | undefined) {
        this.fileName = value
    }

    public get $fileName() {
        return this.fileName
    }

    public set $groupAvatar(value: string | undefined) {
        this.groupAvatar = value
    }

    public get $createdAt(): string | undefined {
        return this.createdAt
    }

    public set $createdAt(value: string | undefined) {
        this.createdAt = value
    }

    public get $updatedAt(): string | undefined {
        return this.updatedAt
    }

    public set $updatedAt(value: string | undefined) {
        this.updatedAt = value
    }

    public get $description(): string | undefined {
        return this.description
    }

    public set $description(value: string | undefined) {
        this.description = value
    }
}

Room.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        roomName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        groupAvatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        background: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: true,
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
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'room',
        tableName: 'rooms',
    },
)

Room.addHook('afterCreate', async (room: Room) => {
    room.dataValues.id = room.$id
})

Room.addHook('beforeValidate', async (room: Room) => {
    room.$updatedAt = new Date().toString()
})

export default Room
