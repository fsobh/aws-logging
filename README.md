<p align="center">
    <a href="https://chain.link/" title="chainlink">
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
| `details`     | `Any` | **Optional**. Any additional details you may want to add. **Defaults to false**  |

####  Log
```javascript
 Logger.log("Logging data");
 //or
 Logger.log("Logging data", 1);
 //or
 Logger.log("Logging data", 1 , {attribute1 : "1", attribute1 : "2", }); 
```

####  Warn
```javascript
 Logger.warn("Warning data");
 //or
 Logger.warn("Warning data", 2);
 //or
 Logger.warn("Warning data", 2 , {attribute1 : "1", attribute1 : "2", }); 
```

####  Error
```javascript
 Logger.error("Error data");
 //or
 Logger.error("Error data", 3);
 //or
 Logger.error("Error data", 3 , {attribute1 : "1", attribute1 : "2", });  
```

