
let AWS = require("aws-sdk");
const ShortUniqueId = require('short-unique-id');
const Notifications = require("./Notifications");
const Template = require('./Template');
AWS.config.update({
    region: "us-east-2",
});


let config = {
    tableName : "SERVICE-LOGS",
    mailList : [],
    stage : "Dev",
    mailSubject : "New AWS Log",
    sourceEmail : false,
    notifyOnSeverityLevel : 10,
    serviceName : null,
    enableNotifications : false,
    region : "us-east-2",
    /**
     * @param {any} config
     */
     update(config)  {
        if(config.tableName)
            this.tableName = config.tableName;
        if(config.mailList && Array.isArray(config.mailList)){

            for (let i = 0 ; i < config.mailList.length ; i ++ )
            {
                if(Notifications.validateEmail(config.mailList[i]))
                    this.mailList[i] = config.mailList[i];
                else
                    console.log(`${config.mailList[i]} is not a valid Email`);
            }
        
        }
        if(config.mailSubject)
            this.mailSubject = config.mailSubject;  
        if(config.notifyOnSeverityLevel)
            this.notifyOnSeverityLevel = config.notifyOnSeverityLevel;
        if(config.serviceName)
            this.serviceName = config.serviceName;
        if(config.stage)
            this.stage = config.stage;
        if(config.enableNotifications)
            this.enableNotifications = config.enableNotifications;
        if(config.region){
            AWS.config.update({region:config.region});
            this.region = config.region;     
        }
        if(config.sourceEmail){
            if(Notifications.validateEmail(config.sourceEmail))
                Notifications.isVerified(config.sourceEmail).then(res => {
                    console.log(res);
                    if(Boolean(res) === true) this.sourceEmail = config.sourceEmail;
                    else console.log(`"${config.sourceEmail}" Must be a verified Email or Domain in your AWS account. Configure this in SES settings in your AWS account`);
                });                    
            else 
            console.log(`${config.sourceEmail} is not a valid Email`);
        }
        if(config.accessKeyId && config.secretAccessKey)
        {
            AWS.config.update(
                {
                    accessKeyId     : config.accessKeyId,
                    secretAccessKey : config.secretAccessKey
                }
            );
        }

    }

};
const  tableExists =  () => 

new Promise((resolve, reject)=> {

  try {

  AWS.config.update({
      region: config.region,
  });

      let dynamodb = new AWS.DynamoDB();
      console.log("Check table: " + config.tableName);
      var params = {
          TableName: config.tableName /* required */
      };
        dynamodb.describeTable(params, function(err, data) {
          if (err) {
          
              console.error(`** WARNING ** -- Table "${config.tableName}" Resource not found.`,err.message); // an error occurred
              resolve(false);
          }
          else {
          
              console.log(`** LOG ** -- Table "${config.tableName}" Resource was found`); // successful response
              resolve(true);
          }
          
      
      });

  } catch (error) {
      console.error(`** ERROR ** -- Table "${config.tableName}" resource not found`,error.message); // an error occurred
      resolve(false);
  }
});
const  createTable =  () => 
{

    try {
        
    console.log(`** LOG ** -- Creating "${config.tableName}" Resource...`);

    AWS.config.update({
        region: config.region,
    });
    var dynamodb = new AWS.DynamoDB();



    var params = {
        TableName : config.tableName,
        KeySchema: [       
            { AttributeName: "ID", KeyType: "HASH"},
            { AttributeName: "TIMESTAMP", KeyType: "RANGE"}
            ],
        AttributeDefinitions: [
            { AttributeName: "ID", AttributeType: "S"},
            { AttributeName: "TIMESTAMP", AttributeType: "N"},       
            { AttributeName: "TYPE", AttributeType: "S" },
            { AttributeName: "SERVICE", AttributeType: "S" },
            { AttributeName: "MESSAGE", AttributeType: "S" },    
           
        ],
        GlobalSecondaryIndexes: [
        {
        IndexName: "TypeIndex",
        KeySchema: [
        
            {
                AttributeName: "TYPE",
                KeyType: "HASH"
            }
        ],
        Projection: {
            ProjectionType: "ALL"
            },
        
        },
        {
            IndexName: "TypeService",
            KeySchema: [
            
                {
                    AttributeName: "SERVICE",
                    KeyType: "HASH"
                }
            ],
            Projection: {
                ProjectionType: "ALL"
                },
          
        },
        {
            IndexName: "TypeMessage",
            KeySchema: [
                {
                    AttributeName: "MESSAGE",
                    KeyType: "HASH"
                }
            ],
            Projection: {
                ProjectionType: "ALL"
                },

        } 
    ],
    BillingMode: "PAY_PER_REQUEST"
    };

dynamodb.createTable(params, function(tableErr, tableData) {
    if (tableErr) {
        console.error(`** ERROR ** -- Table "${config.tableName}" Resource was NOT created.`,tableErr); // an error occurred
        return false;
    } else {
        console.log(`** LOG ** -- Table "${config.tableName}" Resource was Created!`);
        return true;
    }

    });

} catch (error) {

    console.error(`** ERROR ** -- Table "${config.tableName}" resource not found`,error); // an error occurred
    return false;
        
}

};
const  safetyCheck =  () =>

new Promise(async (resolve, reject)=> {
try {
    
    const made = await tableExists();
   
    if(!made)  
        createTable();
    
    resolve(made);
} catch (error) {
    console.log(error);
    resolve(false);
}

});
const  Save =  (message, type = "INFO", severity=0, details = false) =>
new Promise(async (resolve, reject)=> {
    try {

        if (!config.tableName || typeof config.tableName !== "string")
                throw new Error("Table Name was not configured");
        
        if (!config.region || typeof config.region !== "string")
                throw new Error("Region was not configured");
        
        if (!config.serviceName || typeof config.serviceName !== "string")
                throw new Error("Service Name was not configured");
        
        if (!type || typeof type !== "string" || (type !== "INFO" && type !== "WARN" && type !== "ERROR"))
                throw new Error("Not a Valid Log type");
    
        if (!message || typeof message !== "string")
                throw new Error("Log message required");

        await safetyCheck();

        let dynamoDB = new AWS.DynamoDB.DocumentClient({
            apiVersion: "2012-08-10",
        });

        //Notification Trigger
        if(Boolean(config.enableNotifications) === true && severity && severity >= config.notifyOnSeverityLevel){
            if(Array.isArray(config.mailList) && config.mailList.length > 0){
                console.log(config.sourceEmail)
                if(config.sourceEmail){
                
                
                    if(details)
                        await Notifications.sendMail(message,config.mailList,config.mailSubject,Template.generateReportTemplateWithDetails(message,Date.now().toLocaleString(),config.serviceName,severity,details,type),config.sourceEmail);
                    else
                        await Notifications.sendMail(message,config.mailList,config.mailSubject,Template.generateReportTemplate(message,Date.now().toLocaleString(),config.serviceName,severity,type),config.sourceEmail);

                }
                else
                    console.error("Source Email was not configured");
            }
            else 
                console.error("Reciever List was not configured");
        }

        const uid = new ShortUniqueId({ length: 13 });
        let Log={};
        Log.ID = uid();
        Log.TIMESTAMP = Date.now();
        Log.SERVICE = config.serviceName;
        Log.TYPE = type;
        Log.MESSAGE = message;
        Log.SEVERITY = severity;
        Log.STAGE = config.stage;

        if(details)
            Log.Details = JSON.stringify(details);

        const parameters = {
            TableName: config.tableName,
            Item: Log,
        };

        await dynamoDB.put(parameters).promise();
        console.log("Log saved -- ID :  ", Log.ID);
        resolve(true);
    } catch (err) {
        console.error("Log save Error: ", err);
        resolve(false);
    }
});


const log = (message, severity, details, type) =>
    new Promise(async (resolve, reject)=> {

        try {
            if(details)
                console.log(message, details);
            else
                console.log(message);

            await Save(message,type,severity,details);
            resolve(true);
        } catch (error) {

            console.log(error);
            resolve(false);

        }
});

const l =  (message, details = false, severity = 1) => 
    log(message, severity, details, "INFO");

const w =  (message, details = false, severity = 2) => 
    log(message, severity, details, "WARN");

const e =  (message, details = false, severity = 3) => 
    log(message, severity, details, "ERROR");

const  log =  (message, severity=1,details = false) =>
    log(message, severity, details, "INFO");

const  warn =  (message, severity=2,details = false) =>
    log(message, severity, details, "WARN");

const  error =  (message, severity=3,details = false) =>
    log(message, severity, details, "ERROR");

exports.safetyCheck = safetyCheck;
exports.e           = e;
exports.l           = l;
exports.w           = w;
exports.log         = log;
exports.Save        = Save;
exports.warn        = warn;
exports.error       = error; 
exports.config      = config;

