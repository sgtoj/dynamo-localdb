#### Under development. Not published to NPM yet.

# dynamo-localdb

Simple node module that is used to launch and setup local running DynanoDB in 
a development environment. Unlike other NPM dynamodb modules, this project is
more a developer's tool than a simple DynamoDB launcher as it provides a client
too. The purpose is to allow developers working DynamoDB projects to quickly 
setup and reset the database to a given configration (data and schemas alike).

## Instructions

### Installation

```
npm install dynamo-localdb --save
```

#### Requirements 
- Java is required for DynamoDB server.
- Has only been tested NodeJS v6.9.2.

### Examples 

Starting up the local DynamoDB server.

```js
let LocalDB = require("../app/main");
let db = new LocalDB.LocalStore();
db.start().then(() => {
  console.log("DynamoDB server has started. Listening on default port of 8000.")
});
```

Quick test of the server and client.

```js
let LocalDB = require("../app/main");
let db = new LocalDB.LocalStore();
db.start().then(() => {
  console.log("DynamoDB server has started.");
  return db.test();
}).then(result => {
  console.log(`Results of Test: ${ result }`);
  return db.kill(); 
}).then(() => {
  console.log("Database sever has been killed");
});
```

Starting up the local DynamoDB with configuration data for the server.

```js
let LocalDB = require("../app/main");
let config = {
  server: { port: 3000 }
  client: { region: "us-east-1", endpoint: "http://localhost:3000" }
}
let db = new LocalDB.LocalStore();
db.start().then((config) => {
  console.log("DynamoDB server has started. Listening on port 3000.")
});
```

Starting up the local DynamoDB with configuration for the schemas, and data.

```js
let LocalDB = require("../app/main");
let config = {
  schemas: [ 
    /// scheme data as defined by AWS.DynamoDB.createTable() documentation...
  ],
  data: {
    "name-of-table": [{
       /// json representation of data for the given table...
       /// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property
    }]
  }
}
let db = new LocalDB.LocalStore();
db.start().then((config) => {
  console.log("DynamoDB server has started.");
  return db.load();
}).then(() => {
  console.log("DynamoDB server has started")
  console.log("All defined tables and data have been created and inserted.");
  return db.client.list();
}).then(tables => {
  console.load(`List of available tables: ${ tables }`);
});
```

## Troubleshooting

- Change server process `stdio` setting to `inherit` so that stderr pipes to the console.
  - By default server process `stdio`, is set to `ignore`. 
- Error: `missing 'server' JVM...' error 
  - Follow these [steps](http://stackoverflow.com/a/18123162/225522) to resolve.

## Licensing and Notices

- [MIT Licensing](./LICENSE.md)
- [3rd Party Notices](./NOTICES.md) 