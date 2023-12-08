import { Request } from 'express'
import { StorageEngine } from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import MulterCloudinary from 'multer-storage-cloudinary'
import { config } from 'dotenv'

config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

interface CustomCloudinaryStorageOptions {
    cloudinary: any
    params: {
        folder: (req: Request, file: Express.Multer.File) => string
        public_id: (req: Request, file: Express.Multer.File) => string
    }
}

class CustomCloudinaryStorage implements StorageEngine {
    private storage: StorageEngine

    constructor(options: CustomCloudinaryStorageOptions) {
        this.storage = new (MulterCloudinary as any)(options)
    }

    _handleFile(req: Request, file: Express.Multer.File, callback: (error?: any, info?: any) => void): void {
        this.storage._handleFile(req, file, callback)
    }

    _removeFile(req: Request, file: Express.Multer.File, callback: (error: Error | null) => void): void {
        this.storage._removeFile(req, file, callback)
    }
}

const storage: StorageEngine = new CustomCloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req: Request, file: Express.Multer.File) => 'chat',
        public_id: (req: Request, file: Express.Multer.File): string => {
            const filename = file.originalname
            return filename.substring(0, filename.lastIndexOf('.'))
        }
    }
})

export { storage }
export default cloudinary
