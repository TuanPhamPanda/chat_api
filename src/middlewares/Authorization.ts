import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

class Authorization {
    handleAuthentication(request: Request, response: Response, next: NextFunction) {
        const authorizationTokenHeader = request.headers.authorization
        const token = authorizationTokenHeader?.split(' ')[1]

        if (!process.env.ACCESS_TOKEN) {
            return response.status(500).json({
                msg: 'ACCESS_TOKEN or REFRESH_TOKEN is not defined in the environment variables'
            })
        }

        if (!token) {
            return response.sendStatus(401)
        }
        jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
            if (err) {
                return response.sendStatus(403)
            }
        })
    }

    async handleAuthorization(request: Request, response: Response, next: NextFunction) {
        const idRole = (request as any).idRole
        switch (idRole) {
            case 1:
                return next()
            case 2:
                return next()
            case 3:
                return next()
            default:
                return response.sendStatus(403)
        }
    }
}

export default new Authorization()
