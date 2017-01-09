# dynamo-localdb

Simple node module that is used to launch and setup local running DynanoDB in 
a development environment. Unlike other NPM dynamodb modules, this project is
more a developer's tool than a simple DynamoDB launcher as it provides a client
too. The purpose is to allow developers working DynamoDB projects to quickly 
setup and reset the database to a given configration (data and schemas alike).

## Instructions

### Commands

```js
let config = { /* ... */ }
let LocalDB = require("dynamo-localdb");
let db = new LocalDB.LocalStore(config);
```

- `db.start()`: Starts the local DynamoDB server.
- `db.kill()`: Kills the local running DynamoDB server.
- `db.load()`: Configures DynamoDB with the given configuration.
- `db.reload()`: Drops all tables, then calls `db.load()`.
- `db.test()`: Tests where the module's client can interact with the server.


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
let LocalDB = require("dynamo-localdb");
let db = new LocalDB.LocalStore();
db.start().then(() => {
  console.log("DynamoDB server has started. Listening on default port of 8000.")
});
```

Quick test of the server and client.

```js
let LocalDB = require("dynamo-localdb");
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
let LocalDB = require("dynamo-localdb");
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
let LocalDB = require("dynamo-localdb");
let config = {
  schemas: [ 
    /* scheme data as defined by AWS.DynamoDB.createTable() documentation... */
    /* http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property */
  ],
  data: {
    "name-of-table": [{
       /* json representation of data for the given table... */
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
  console.log(`List of available tables: ${ tables }`);
});
```

### Configuration
```js
let config = {
  server: { 
    port: 8000
    /* see full list of available options defined at... */
    /* https://github.com/Medium/local-dynamo */
  },
  client: {     
    region: "us-east-1",
    endpoint: "http://localhost:8000",
    accessKeyId: "AKID",
    serectAccessKey: "SECRET"
    /* see full list available options defined at... */
    /* http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property */
  },
  schema: [ /* array of schemas */
    {
      /* see AWS.DynamoDB.createTable() documentation */
      /* http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property */
    }
  ],
  data: {
    "TABLE-NAME-HERE" : [ /* array of documents for given table */
      {
       /* json representation a documnent's data for the given table... */ 
      }
    ]
  }
}
```

##### Note
- If `server.port` is changed, the port value must match at `client.endpoint`. 

## Troubleshooting

- Change server process `stdio` setting to `inherit` so that stderr pipes to the console.
  - By default server process `stdio`, is set to `ignore`. 
- Error: `missing 'server' JVM...' error 
  - Follow these [steps](http://stackoverflow.com/a/18123162/225522) to resolve.

## Licensing and Notices

- [MIT License Notice](./LICENSE.md)
- [3rd-Party Notices](./NOTICES.md) 