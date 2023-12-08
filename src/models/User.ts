import { Model, DataTypes } from 'sequelize'
import sequelize from './Sequelize'
import { v4 as uuidV4 } from 'uuid'

class User extends Model {
    id: string = uuidV4()
    declare iss: string
    declare nbf: number
    declare aud: string
    declare sub: number
    declare email: string
    declare email_verified: boolean
    declare azp: string
    declare name: string
    declare picture: string
    declare given_name: string
    declare family_name: string
    declare iat: number
    declare exp: number
    declare jti: string

    declare createdAt: Date
    declare updatedAt: Date
}

User.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        iss: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nbf: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        aud: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sub: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        azp: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        given_name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        family_name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        iat: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        exp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        jti: {
            type: DataTypes.STRING,
            allowNull: false
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
        modelName: 'user',
        tableName: 'users'
    }
)

User.addHook('afterCreate', async (user: User, options: any) => {
    user.dataValues.id = user.id
})

User.addHook('beforeValidate', async (user: User) => {
    user.updatedAt = new Date()
})

export default User
