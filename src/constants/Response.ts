export default class Response {
    err?: number
    response?: any
    msg?: string

    constructor(response?: any, msg?: string, err?: 0 | 1) {
        this.response = response
        this.msg = msg
        this.err = err
    }
}
