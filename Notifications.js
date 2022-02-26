let AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
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
sendMail : async function (Message,To,Subject , Html = `<div></div>`,sender) {

    try {
        
    
    var params = {
      Destination: {
        ToAddresses: To,
      },
      Message: {
        Body: {
          Text: { Data: Message },
          Html : { Data : Html},
        },

        
  
        Subject: { Data: Subject },
      },
      Source: sender,
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
extractDomain(email){
    if (!email || typeof email !== "string") return false;

    if(!this.validateEmail(email)) return "That was not an email"
 
    return email.substring(email.indexOf("@") + 1);
},
validatePhoneNumber(phone) {
    if (!phone ||  typeof phone !== "string") return false;

    var phoneRe = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;

    return phoneRe.test(phone);
},
fetchVerifiedSenders  () {

    return new Promise(resolve => {
       try {
         
   
  
      var params = {
        
       };

       ses.listIdentities(params).promise().then(function(data) {
  
        if(data && data.Identities && data.Identities.length > 0){
          resolve(data.Identities)
          
        }
         
       }).catch(err => resolve([]));;
    
   
  
    } catch (error) {
      console.log(error)
      return false
    }
  
  })

},
isVerified(sender) {
  return new Promise(  resolve => {
  try {
    let list = []
    if(!this.validateEmail(sender)) return false

    this.fetchVerifiedSenders().then(all=> {
      list = all    
      console.log("Verified : ", list)
    }).finally(()=> {

        for(var c = 0 ; c < list.length ; c ++ ){
           if (String(sender).toLowerCase() === String(list[c]).toLowerCase() || 
               String(this.extractDomain(sender)).toLowerCase() ===  String(list[c]).toLowerCase())
                resolve(true);
        }
        resolve(false) 
          })


  } catch (error) {
    
  }

})}
}
