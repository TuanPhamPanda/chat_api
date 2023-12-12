import { Model, DataTypes } from 'sequelize'
import { v4 as uuidV4 } from 'uuid'
import sequelize from './Sequelize'
import File from './File'
import Room from './Room'
import User from './User'

export interface MessageAttributes {
    id?: string
    idUser: string
    idRoom?: string
    idFile?: string
    contentMessage?: string
}

class Message extends Model {
    private id?: string
    private idRoom?: string
    private idFile?: string
    private contentMessage?: string
    private idUser?: string

    private createdAt?: Date
    private updatedAt?: Date

    constructor(messageAttributes?: MessageAttributes) {
        super()
        if (messageAttributes?.id) {
            this.id = messageAttributes.id
        } else {
            this.id = uuidV4()
        }
        this.id = messageAttributes?.id
        this.idRoom = messageAttributes?.idRoom
        this.idFile = messageAttributes?.idFile
        this.contentMessage = messageAttributes?.contentMessage
        this.idUser = messageAttributes?.idUser
    }

    public get $id(): string | undefined {
        return this.id
    }

    public set $id(id: string) {
        this.id = id
    }

    public get $idFile(): string | undefined {
        return this.idFile
    }

    public set $idFile(idFile: string) {
        this.idFile = idFile
    }

    public get $idRoom(): string | undefined {
        return this.idRoom
    }

    public set $idRoom(idRoom: string) {
        this.idRoom = idRoom
    }

    public get $contentMessage(): string | undefined {
        return this.contentMessage
    }

    public set $contentMessage(contentMessage: string) {
        this.contentMessage = contentMessage
    }

    public get $idUser(): string | undefined {
        return this.idUser
    }

    public set $idUser(idUser: string) {
        this.idUser = idUser
    }

    public get $createdAt(): Date | undefined {
        return this.createdAt
    }

    public set $createdAt(createdAt: Date | undefined) {
        this.createdAt = createdAt
    }

    public get $updatedAt(): Date | undefined {
        return this.updatedAt
    }

    public set $updatedAt(updatedAt: Date | undefined) {
        this.updatedAt = updatedAt
    }
}

Message.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        idFile: {
            type: DataTypes.STRING,
            references: {
                model: File,
                key: 'id'
            }
        },
        idRoom: {
            type: DataTypes.STRING,
            references: {
                model: Room,
                key: 'id'
            }
        },
        idUser: {
            type: DataTypes.STRING,
            references: {
                model: User,
                key: 'id'
            }
        },
        contentMessage: {
            type: DataTypes.STRING
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
        modelName: 'message',
        tableName: 'messages'
    }
)

Message.addHook('afterCreate', (message: Message) => {
    message.dataValues.id = message.$id
})

Message.addHook('beforeValidate', (message: Message) => {
    message.$updatedAt = new Date()
})

Message.belongsTo(File, {
    foreignKey: 'idFile',
    onDelete: 'CASCADE'
})

Message.belongsTo(Room, {
    foreignKey: 'idRoom'
})

Message.belongsTo(User, {
    foreignKey: 'idUser'
})

export default Message
