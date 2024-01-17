import IUserDTO from './IUserDTO'
import IMessageDTO from './IMessageDTO'

export default interface IRoomDTO {
    users: IUserDTO[]
    messages: IMessageDTO[]
    roomName: string
    updatedAt: string
    id: string
    background: string
    groupAvatar: string
    fileName: string
    description: string
}
