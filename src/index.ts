import express, { Express, Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import routeChat from '@/routers'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8080

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    next()
})

app.use('/api', routeChat.getRouter)

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
