let AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
//const Template = require('./Template')
let sns = new AWS.SNS();
var ses = new AWS.SES();
module.exports = {
  sendText: async function (phone, message) {
    
try {

    let params = {
      Message: message,
      MessageStructure: "text",
      PhoneNumber: `+1${phone}`,
      //TopicArn: 'TOPIC_ARN'
    };

    let result = await sns.publish(params).promise();
    console.log("SNS:", result);
    return true
} catch (error) {
    console.log("SNS ERROR:", error);
    return false   
}

  },
  sendMail : async function (Message,To,Subject , Html = `<div></div>`) {

    try {
        
    
    var params = {
      Destination: {
        ToAddresses: [To],
      },
      Message: {
        Body: {
          Text: { Data: Message },
          Html : { Data : Html},
        },

        
  
        Subject: { Data: Subject },
      },
      Source: "pingsoftwareusa@gmail.com",
    };
   
    
    
    let result = ses.sendEmail(params).promise()
    console.log("SES:", result);
    return true;

} catch (error) {
    console.error("SES ERROR:", error);
    return false   
}
  },
  validateEmail(email) {
    if (!email || typeof email !== "string") return false;

    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  validatePhoneNumber(phone) {
    if (!phone ||  typeof phone !== "string") return false;

    var phoneRe = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;

    return phoneRe.test(phone);
  },
};