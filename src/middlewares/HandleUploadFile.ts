import multer, { Multer } from 'multer'
import { storage } from '@/helpers'

const upload: Multer = multer({ storage: storage })

export { upload }
