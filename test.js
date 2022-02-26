// let Logger = require('./index');
let Logger = require("./index");
Logger.config.update(
    {
        tableName : "SERVICE-LOGS",
        mailList : ["fsobh15@icloud.com"],
        stage : "Dev",
        mailSubject : "New AWS Log",
        sourceEmail : 'pingsoftwareusa@gmail.com',
        notifyOnSeverityLevel : 3,
        serviceName : "aaa",
        enableNotifications : true,
        region : "us-east-2",

    })



    Logger.log("s")







