<p align="center">
    <a href="https://aws.amazon.com" title="AWS">
        <img  height=230px src="https://pbs.twimg.com/profile_images/1473756532827246593/KRgw2UkV_400x400.jpg" alt="AWS">
    </a>
</p>

<div align="center">

# aws-logging
### Logs activity across all services under a single AWS account. Optional features can be enabled to trigger Email notifications based on the logs severity level.


[![JavaScript](https://img.shields.io/badge/JavaScript-%23FFFF00)](https://img.shields.io/badge/JavaScript-%23FFFF00)    [![Node](https://img.shields.io/badge/NodeJS-v14.0.1-brightgreen)](https://img.shields.io/badge/NodeJS-v14.x.x-brightgreen) 
 [![AWS](https://img.shields.io/badge/AWS-Cloud%20provider-orange)](https://img.shields.io/badge/AWS-Cloud%20provider-orange)
[![Dynamo](https://img.shields.io/badge/DynamoDB-Database-blue)](https://img.shields.io/badge/DynamoDB-Database-blue) [![Lambda](https://img.shields.io/badge/Lambda-service-%20%09%23a26c2f)](https://img.shields.io/badge/Lambda-service-%20%09%23a26c2f)  [![SES](https://img.shields.io/badge/SES-aws--sdk-yellowgreen)](https://img.shields.io/badge/SES-aws--sdk-yellowgreen)
</div>


## Installation
####  Install the Package

```bash
  npm install aws-logging
```

## Import the module

```javascript
 let Logger = require('aws-logging');
```

## Configure your logger

```javascript
 Logger.config.update(
    {
        tableName : "SERVICE-LOGS",  
        mailList : ["example@icloud.com"],
        stage : "Dev",
        mailSubject : "New AWS Log",
        sourceEmail : "example@yourVerifiedEmailOrDomain.com",
        notifyOnSeverityLevel : 10,
        serviceName : "sample-service",
        enableNotifications : false,
        region : "us-east-2",
        accessKeyId : "xxxx",
        secretAccessKey : "xxxx"

    });
```
# IMPORTANT :

### Make sure the IAM role has the following permissions enabled on AWS AND in your app.
(The role you generated your  Access Key  and Secret from)

```yaml
  iamRoleStatements:
    - Effect: "Allow"
      Action:
        - "logs:*"
      Resource: "*" 
    - Effect: "Allow"
      Action:
        - "dynamodb:*"
      Resource: "*"
    - Effect: "Allow"
      Action: "ses:ListIdentities"
      Resource: "*" 
    - Effect: "Allow"
      Action: "ses:SendEmail"
      Resource: "*"
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `tableName`      | `String`| **Required**. The name of the table that will be automatically created to store your logs. Defaults to `"SERVICE-LOGS"`. Must be unique from other table names. |
| `mailList`       | `Array` | **Optional**. A list of recipient emails that will recieve log alerts |
| `mailSubject`     | `String` | **Optional**. The email subject to be displayed for recipients when they recieve a log alert. Defaults to `"New AWS Log"`  |
| `sourceEmail`     | `String` | **Optional**. The sender email used to send the logs.  **Must be a verified email in your AWS account or under a verified Domain** |
| `notifyOnSeverityLevel`     | `Integer` | **Required**. The severity level a log must have in order to trigger an email alert. Defaults to `10`. (max 10 - min 0) |
| `serviceName`     | `String` | **Required**. The name of the service you added this package to. This will be used to identify which service the log belongs to in the `SERVICE-LOGS` table |
| `enableNotifications`     | `Boolean` | **Optional**. Specify if you want email alerts enabled. **Note : If set to `true`, The following fields will be required : `mailList`, and `sourceEmail`** . |
| `region`     | `String` | **Required** . The AWS region you want this Logger configured for. **Note : Must be the same as the region that the `sourceEmail` is configured for in your AWS account**  |
| `accessKeyId`     | `String` | **Required** . Your AWS IAM access Key. Not required if you dont have to configure this before using `aws-sdk` in your service  |
| `secretAccessKey`     | `String` | **Required** . Your AWS IAM secret Key. Not required if you dont have to configure this before using `aws-sdk` in your service  |


## Usage
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `message`      | `String`| **Required**. The message you want to log |
| `severity`       | `Array` | **Optional**. Severity level (max 10 - min 0). **Defaults : `{Log : 1 , Warn : 2 , Error : 3}`** |
| `details`     | `JSON Object` | **Optional**. Any additional details you may want to add. **Defaults to false**  |

### Partial example from this [example app](https://github.com/fsobh/Chainlink-External-Initiator-Template/blob/Dev/app.js)

```javascript
var express = require('express');
const serverless = require('serverless-http');
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const Logger = require("aws-logging");

Logger.config.update({
  
    mailList : [process.env.RECIEVER_EMAIL_1],
    sourceEmail : process.env.SOURCE_EMAIL,
    notifyOnSeverityLevel : 5,
    serviceName : process.env.SERVICE_NAME,
    enableNotifications : true,
    region:"us-east-2",
    accessKeyId : process.env.KEY,
    secretAccessKey : process.env.SECRET

})
app.get('/', async function (req, res) {

    try {

        await Logger.log("Health Check ran", 1, {request : {body : JSON.parse(JSON.stringify(req.body))}});
        res.sendStatus(200);
        
    } catch (error) {
        
        await Logger.error(error.message,3,
            {
                stack : error.stack,
                error : String(error)
            });
        res.send({'error' : error}).sendStatus(500);
    }

})

module.exports.handler = serverless(app);
```



####  Log
```javascript
 await Logger.log("Logging data");
 //or
 await Logger.log("Logging data", 1);
 //or
 await Logger.log("Logging data", 1 , {attribute1 : "1", attribute1 : "2", }); 
```

####  Warn
```javascript
 await Logger.warn("Warning data");
 //or
 await Logger.warn("Warning data", 2);
 //or
 await Logger.warn("Warning data", 2 , {attribute1 : "1", attribute1 : "2", }); 
```

####  Error
```javascript
 await Logger.error("Error data");
 //or
 await Logger.error("Error data", 3);
 //or
 await Logger.error("Error data", 3 , {attribute1 : "1", attribute1 : "2", });  
```

