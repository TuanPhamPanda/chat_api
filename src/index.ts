import express, { Express } from 'express'
import dotenv from 'dotenv'
dotenv.config()
import bodyParser from 'body-parser'
import routeChat from '@/routers'
import cors from 'cors'

const app: Express = express()
const port = process.env.PORT || 8080

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors({ origin: 'http://localhost:5173' }))

app.use('/api', routeChat.getRouter)

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
