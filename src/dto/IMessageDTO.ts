import IUserDTO from './IUserDTO'

export default interface IMessageDTO {
    id: string
    user: IUserDTO
    content: string
    idFile?: string
    updatedAt: string
    type: 'message' | 'file'
    fileSize: number
    fileName: string
}
