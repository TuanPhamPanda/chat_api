import { Response } from 'express'

//500
export function internalServer(response: Response, error: any) {
    return response.status(500).json(error)
}
//400
export function badRequest(response: Response, error: string) {
    return response.status(400).json({ err: 1, msg: error })
}

//404

//403
