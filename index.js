
let AWS = require("aws-sdk");
const TABLE_NAME = "SERVICE-LOGS"
AWS.config.update({
    region: "us-east-2",
});

const  tableExists = (tableName = TABLE_NAME, region = "us-east-2" ) => 

new Promise((resolve, reject)=> {

  try {

  AWS.config.update({
      region: region,
  });

      let dynamodb = new AWS.DynamoDB();
      console.log("Check table: " + TABLE_NAME);
      var params = {
          TableName: tableName /* required */
      };
        dynamodb.describeTable(params, function(err, data) {
          if (err) {
          
              console.error(`** WARNING ** -- Table "${tableName}" Resource not found.`,err.message); // an error occurred
              resolve(false);
          }
          else {
          
              console.log(`** LOG ** -- Table "${tableName}" Resource was found`); // successful response
              resolve(true);
          }
          
      
      });

  } catch (error) {
      console.error(`** ERROR ** -- Table "${tableName}" resource not found`,err.message); // an error occurred
      resolve(false);
  }
})
const  createTable = (tableName = TABLE_NAME, region = "us-east-2") => {

    try {
        
    console.log(`** LOG ** -- Creating "${tableName}" Resource...`);

    AWS.config.update({
        region: region,
    });
    var dynamodb = new AWS.DynamoDB();



    var params = {
        TableName : tableName,
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
        console.error(`** ERROR ** -- Table "${tableName}" Resource was NOT created.`,err); // an error occurred
        return false;
    } else {
        console.log(`** LOG ** -- Table "${tableName}" Resource was Created!`);
        return true;
    }

    })

} catch (error) {

    console.error(`** ERROR ** -- Table "${tableName}" resource not found`,err); // an error occurred
    return false;
        
}

 }


async function safetyCheck (tableName = TABLE_NAME, region = "us-east-2"){

try {
    
  
    if(!(await tableExists(tableName,region)))   
        createTable(tableName,region)

    return true
} catch (error) {
    console.log(error)
    return false
}

}

exports.safetyCheck = safetyCheck
//Will implement later
//implement severity level with SES notification and config
// exports.log = 
// exports.warn = 
// exports.error = 
// exports.config = 
