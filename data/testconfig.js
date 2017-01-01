module.exports = {
        "schemas": [
        {
            "TableName" : "test-dynamodb-localdb-table",
            "KeySchema": [       
                { "AttributeName": "specialNumber", "KeyType": "HASH"}, 
                { "AttributeName": "reason", "KeyType": "RANGE" } 
            ],
            "AttributeDefinitions": [       
                { "AttributeName": "specialNumber", "AttributeType": "N"}, 
                { "AttributeName": "reason", "AttributeType": "S" }
            ],
            "ProvisionedThroughput": {       
                "ReadCapacityUnits": 5, 
                "WriteCapacityUnits": 5
            }
        }
        ],
        "data": {
            "test-dynamodb-localdb-table": [{
                    "specialNumber": 1138,
                    "reason": "George Lucas",
                    "jedi": "may the force be with you"
            }]
        }
}