import { Sequelize } from 'sequelize'

const DB_HOST: string = process.env.DB_HOST || 'localhost'
const DB_NAME: string = process.env.DB_NAME || 'chat'
const DB_USERNAME: string = process.env.DB_USERNAME || 'root'
const DB_PASSWORD: string = process.env.DB_PASSWORD || ''

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    logging: false,
    query: { raw: false },
    timezone: '+07:00',
    dialectOptions: {
        dateStrings: true,
        typeCast: true
    }
})

export default sequelize
