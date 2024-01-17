import { Model, DataTypes } from 'sequelize'
import sequelize from './Sequelize'
import { v4 as uuidV4 } from 'uuid'

export interface FileAttributes {
    id?: string
    fileName: string
    path: string
    originalName: string
    size: number
}

class File extends Model {
    private id?: string
    private fileName!: string
    private path!: string
    private originalName!: string
    private createdAt?: Date
    private updatedAt?: Date
    private size?: number

    constructor(fileAttributes?: FileAttributes) {
        super()
        if (fileAttributes) {
            if (fileAttributes.id) {
                this.id = fileAttributes.id
            } else {
                this.id = uuidV4()
            }

            this.fileName = fileAttributes.fileName
            this.path = fileAttributes.path
            this.originalName = fileAttributes.originalName
            this.size = fileAttributes.size
        }
    }

    public get $id(): string | undefined {
        return this.id
    }

    public set $id(id: string) {
        this.id = id
    }

    public get $fileName(): string {
        return this.fileName
    }

    public set $fileName(fileName: string) {
        this.fileName = fileName
    }

    public get $path(): string {
        return this.path
    }

    public set $path(path: string) {
        this.path = path
    }

    public get $originalName(): string {
        return this.originalName
    }

    public set $originalName(originalName: string) {
        this.originalName = originalName
    }

    public get $createdAt(): Date | undefined {
        return this.createdAt
    }

    public set $createdAt(createdAt: Date) {
        this.createdAt = createdAt
    }

    public get $updatedAt(): Date | undefined {
        return this.updatedAt
    }

    public set $updatedAt(updatedAt: Date) {
        this.updatedAt = updatedAt
    }

    public set $size(size: number) {
        this.size = size
    }

    public get $size(): number | undefined {
        return this.size
    }
}

File.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        originalName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.NUMBER,
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
        modelName: 'file',
        tableName: 'files'
    }
)

File.addHook('afterCreate', async (file: File) => {
    file.dataValues.id = file.$id
})

File.addHook('beforeValidate', async (file: File) => {
    file.$updatedAt = new Date()
})

export default File
