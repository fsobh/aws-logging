//just a test file for local dev
const a = require("./index")

a.config.update({tableName : "a"})
console.log(a.config)