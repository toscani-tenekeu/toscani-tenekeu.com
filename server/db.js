import { openDatabase, resolveDatabasePath } from './database.js'

const db = openDatabase()

db.close()

console.log(`Database initialized at ${resolveDatabasePath()}.`)
