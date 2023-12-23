import { Request } from 'express'
import { StorageEngine } from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import MulterCloudinary from 'multer-storage-cloudinary'
import { config } from 'dotenv'
import joi from 'joi'
import { Room } from '@/models'
import { v4 } from 'uuid'

config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

interface ICustomCloudinaryStorageOptions {
    cloudinary: any
    params: {
        folder: (req: Request, file: Express.Multer.File) => Promise<string>
        public_id: (req: Request, file: Express.Multer.File) => string
    }
}

class CustomCloudinaryStorage implements StorageEngine {
    private storage: StorageEngine

    constructor(options: ICustomCloudinaryStorageOptions) {
        this.storage = new (MulterCloudinary as any)(options)
    }

    _handleFile(req: Request, file: Express.Multer.File, callback: (error?: any, info?: any) => void): void {
        this.storage._handleFile(req, file, callback)
    }

    _removeFile(req: Request, file: Express.Multer.File, callback: (error: Error | null) => void): void {
        this.storage._removeFile(req, file, callback)
    }
}

const getFolders = async (req: Request, file: Express.Multer.File) => {
    try {
        if (!req.body?.idRoom) {
            throw { status: 400, msg: 'idRoom is required' }
        }

        const { error, value } = joi.string().uuid({ version: 'uuidv4' }).required().validate(req.body.idRoom)

        if (error) {
            throw { status: 400, message: error.details[0].message }
        }
        const room = await Room.findByPk(value)
        if (!room) {
            throw { status: 400, message: 'Room not found' }
        }
        return `chat/${value}`
    } catch (error) {
        throw { status: 500, error }
    }
}

const storage: StorageEngine = new CustomCloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: getFolders,
        public_id: (req: Request, file: Express.Multer.File): string => {
            const filename = file.originalname
            return filename.substring(0, filename.lastIndexOf('.')) + `-${v4()}`
        }
    }
})

export { storage }
export default cloudinary
