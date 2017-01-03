/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../declaration/main.d.ts" />
/// <reference path="../declaration/server.d.ts" />
/// <reference path="../declaration/client.d.ts" />

"use strict";

const expect = require("chai").expect;
const assert = require("chai").assert;

before(done => {
    done();
});

after(done => {
    done();
});

describe("module", () => {

    const LocalDB = require("../app/main");
    const LocalStore = LocalDB.LocalStore;
    const LocalStoreSchemaClient = require("../app/client").LocalStoreSchemaClient;
    const LocalStoreDataClient = require("../app/client").LocalStoreDataClient;
    const LocalStoreClient = require("../app/client").LocalStoreClient;
    const LocalStoreServer = require("../app/server").LocalStoreServer;

    const ChildProcess = require("child_process").ChildProcess;
    const tmpTable = require("../data/tmptable");
    const defaults = require("../data/defaults");
    const clientConfig = require("../data/testconfig").client;
    const serverConfig = require("../data/testconfig").server;
    const table = tmpTable.schemas[0];
    const data = tmpTable.data[table.TableName]

    describe("LocalStoreServer", () => {

        describe("consturctor()", () => {
            it("should create an instance of itself", () => {
                const db = new LocalStoreServer();
                expect(db).be.an.instanceOf(LocalStoreServer);
            });
            it("should use the default configuration", () => {
                const db = new LocalStoreServer();
                expect(db.config.port).to.be.equal(serverConfig.port);
            });
            it("should use the configuration passed as parameter", () => {
                const config = JSON.parse(JSON.stringify(serverConfig));
                config.port = 8001;
                const db = new LocalStoreServer(config);
                expect(db.config.port).to.be.equal(config.port);
            });
        });

        describe("configure()", () => {
            it("should should use default configuration", () => {
                const defaultConfig = JSON.parse(JSON.stringify(serverConfig));
                const db = new LocalStoreServer();
                db.configure(defaultConfig);
                expect(db.config.port).to.be.equal(defaultConfig.port);
            });
            it("should change the server configuration", () => {
                const config = JSON.parse(JSON.stringify(serverConfig));
                config.port = 8001;
                const db = new LocalStoreServer();
                db.configure(config);
                expect(db.config.port).to.be.equal(config.port);
            });
        });

        describe("start()", () => {
            it("should start local instance of DynamoDB", () => {
                const svr = new LocalStoreServer();
                svr.start().then(() => {
                    expect(svr.process).to.be.instanceOf(ChildProcess);
                    return svr.kill();
                }).catch(err => {
                    return svr.kill().then(() => {
                        throw err;
                    });
                });
            });
        });

        describe("kill()", () => {
            it("should return kill the running process", () => {
                const svr = new LocalStoreServer();
                return svr.start().then(() => {
                    return svr.kill();
                }).then(() => {
                    expect(svr.process).to.be.equal(null);                    
                }).catch(err => {
                    return svr.kill().then(() => {
                        throw err;
                    });
                });
            });
        });

        describe("process", () => {
            it("should return null before start() is called", () => {
                const svr = new LocalStoreServer();
                const process = svr.process;
                expect(process).to.be.equal(null);
            });
            it("should return ChildProcess object", () => {
                const svr = new LocalStoreServer();
                return svr.start().then(() => {
                    expect(svr.process).to.be.instanceOf(ChildProcess);
                    return svr.kill();
                }).catch(err => {
                    return svr.kill().then(() => {
                        throw err;
                    });
                });
            });
        });

        describe("ready", () => {
            it("should not be ready until server is started", () => {
                const svr = new LocalStoreServer();
                expect(svr.ready).to.be.equal(false);
            });
            it("should be ready after server is started", () => {
                const svr = new LocalStoreServer();
                return svr.start().then(() => {
                    expect(svr.ready).to.be.equal(true);
                    return svr.kill();
                }).catch(err => {
                    return svr.kill().then(() => {
                        throw err;
                    });
                });
            });
        });

    });

    describe("LocalStoreSchemaClient", () => {
        let AWS;
        let testDBServer;

        beforeEach(() => {
            AWS = require("aws-sdk");
            AWS.config.update(defaults.client);
            testDBServer = new LocalStoreServer();
            return testDBServer.start();
        });

        afterEach(() => {
            return testDBServer.kill();
        });    
        
        describe("constructor()", () => {
            it("should create an instance of itself", () => {
                const dynamodb = new AWS.DynamoDB();
                const client = new LocalStoreSchemaClient(dynamodb);
                expect(client).be.an.instanceOf(LocalStoreSchemaClient);
            });
        });

        describe("create()", () => {
            it("should create new table on the server without errors", () => { 
                const dynamodb = new AWS.DynamoDB();
                const client = new LocalStoreSchemaClient(dynamodb);
                return client.create(table).then(() => {
                    return client.list();
                }).then(tables => {
                    const result = tables.some(t => { 
                        return t === table.TableName
                    });
                    expect(result).to.be.equal(true);
                });
            });
        });

        describe("delete()", () => {
            it("should delete existing table on the server without errors", () => { 
                const dynamodb = new AWS.DynamoDB();
                const client = new LocalStoreSchemaClient(dynamodb);
                return client.create(table).then(() => {
                    return client.delete(table.TableName);
                }).then(() => {
                    return client.list();
                }).then(tables => {
                    const result = tables.some(t => { 
                        return t === table.TableName
                    });
                    expect(result).to.be.equal(false);
                });
            });
        });

        describe("list()", () => {
            it("should return any array of existing tables", () => { 
                const dynamodb = new AWS.DynamoDB();
                const client = new LocalStoreSchemaClient(dynamodb);
                return client.create(table).then(() => {
                    return client.list();
                }).then(tables => {
                    expect(tables).is.an("array");
                });
            });
            it("should list table that was just created", () => { 
                const dynamodb = new AWS.DynamoDB();
                const client = new LocalStoreSchemaClient(dynamodb);
                return client.create(table).then(() => {
                    return client.list();
                }).then(tables => {
                    let result = tables.some(t => {
                        return t === table.TableName;
                    })
                    expect(result).to.be.equal(true);
                });
            });
        });

    });


    describe("LocalStoreDataClient", () => {
        let AWS;
        let testDBServer;
        let testDBSchemaClient;

        beforeEach(() => {
            AWS = require("aws-sdk");
            AWS.config.update(defaults.client);
            const dynamodb = new AWS.DynamoDB();
            testDBServer = new LocalStoreServer();
            testDBSchemaClient = new LocalStoreSchemaClient(dynamodb);
            return testDBServer.start().then(() => {
                return testDBSchemaClient.create(table);
            });
        });

        afterEach(() => {
            if (!!testDBServer && !!testDBServer.kill)
                return testDBServer.kill();
        });
        
        describe("constructor()", () => {
            it("should create an instance of itself", () => {
                const dbClient = new AWS.DynamoDB();
                const dbDocClient = new AWS.DynamoDB.DocumentClient();
                const client = new LocalStoreDataClient(dbClient, dbDocClient);
                expect(client).be.an.instanceOf(LocalStoreDataClient);
            });
        });

        describe("insert()", () => {
            it("should insert new document into the table", () => {
                const dbClient = new AWS.DynamoDB();
                const dbDocClient = new AWS.DynamoDB.DocumentClient();
                const client = new LocalStoreDataClient(dbClient, dbDocClient);
                return client.insert(table.TableName, data[0]).then(() => {
                    return client.count(table.TableName);
                }).then(count => {
                    expect(count).to.be.equal(1);
                });
            });
        });

        describe("import()", () => {
            it("should import multiple documents into the table", () => {
                const dbClient = new AWS.DynamoDB();
                const dbDocClient = new AWS.DynamoDB.DocumentClient();
                const client = new LocalStoreDataClient(dbClient, dbDocClient);
                const data2 = JSON.parse(JSON.stringify(data[0]));
                data2.specialNumber = 43;
                data2.reason = "Forrest Gump"
                return client.import(table.TableName, [data[0],data2]).then(() => {
                    return client.count(table.TableName);
                }).then(count => {
                    expect(count).to.be.equal(2);
                });
            });
        });

        describe("read()", () => {
            it("should return an array of documents", () => {
                const dbClient = new AWS.DynamoDB();
                const dbDocClient = new AWS.DynamoDB.DocumentClient();
                const client = new LocalStoreDataClient(dbClient, dbDocClient);
                return client.read(table.TableName).then(documents => {
                    expect(documents).is.an("array");
                });
            });
            it("should read the document of given table", () => {
                const dbClient = new AWS.DynamoDB();
                const dbDocClient = new AWS.DynamoDB.DocumentClient();
                const client = new LocalStoreDataClient(dbClient, dbDocClient);
                return client.insert(table.TableName, data[0]).then(() => {
                    return client.read(table.TableName);
                }).then(documents => {
                    expect(documents.length).to.be.equal(1);
                });
            });
            it("should read the documents of given table", () => {
                const dbClient = new AWS.DynamoDB();
                const dbDocClient = new AWS.DynamoDB.DocumentClient();
                const client = new LocalStoreDataClient(dbClient, dbDocClient);
                const data2 = JSON.parse(JSON.stringify(data[0]));
                data2.specialNumber = 43;
                data2.reason = "Forrest Gump"
                return client.import(table.TableName, [data[0],data2]).then(() => {
                    return client.read(table.TableName);
                }).then(documents => {
                    expect(documents.length).to.be.equal(2);
                });
            });
        });

        describe("count()", () => {
            it("should import multiple documents into the table", () => {
                const dbClient = new AWS.DynamoDB();
                const dbDocClient = new AWS.DynamoDB.DocumentClient();
                const client = new LocalStoreDataClient(dbClient, dbDocClient);
                const data2 = JSON.parse(JSON.stringify(data[0]));
                data2.specialNumber = 43;
                data2.reason = "Forrest Gump"
                return client.import(table.TableName, [data[0],data2]).then(() => {
                    return client.count(table.TableName);
                }).then(count => {
                    expect(count).to.be.equal(2);
                });
            });
        });

    });


    describe("LocalStoreClient", () => {
        
        describe("constructor()", () => {
            it("should create an instance of itself", () => {
                const client = new LocalStoreClient();
                expect(client).be.an.instanceOf(LocalStoreClient);
            });
        });

        describe("test()", () => {
            it("should start server and test schema operations", () => {
                const client = new LocalStoreClient();
                const svr = new LocalStoreServer();
                return svr.start().then(() => {
                    return client.test();                    
                }).then(result => {
                    expect(result).to.be.equal(true);    
                    return svr.kill();                
                }).catch(err => {
                    return svr.kill().then(() => {
                        throw err;
                    });
                });
            });
            it("should start server and test schema and data operations", () => {
                const client = new LocalStoreClient();
                const svr = new LocalStoreServer();
                return svr.start().then(() => {
                    return client.test(true);                    
                }).then(result => {
                    expect(result).to.be.equal(true);    
                    return svr.kill();                
                }).catch(err => {
                    return svr.kill().then(() => {
                        throw err;
                    });
                });
            });
        });

        describe("data", () => {
            it("should be LocalStoreDataClient", () => {
                const LocalStoreDataClient = require("../app/client").LocalStoreDataClient;
                const client = new LocalStoreClient();
                expect(client.data).be.an.instanceOf(LocalStoreDataClient);
            });
        });

        describe("ready", () => {
            it("should be ready as the client is created", () => {
                const client = new LocalStoreClient();
                expect(client.ready).to.be.equal(true);
            });
        });

        describe("schema", () => {
            it("should be LocalStoreSchemaClient", () => {
                const LocalStoreSchemaClient = require("../app/client").LocalStoreSchemaClient;
                const client = new LocalStoreClient();
                expect(client.schema).be.an.instanceOf(LocalStoreSchemaClient);
            });
        });
    });

    describe("LocalStore", () => {

        describe("constructor()", () => {
            it("should create an instance of itself", () => {
                const db = new LocalStore();
                expect(db).be.an.instanceOf(LocalStore);
            });
            it("should create server property of LocalStoreClient type", () => {
                const db = new LocalStore();
                expect(db.client).be.an.instanceOf(LocalStoreClient);
            });
            it("should create server property of LocalStoreServer type", () => {
                const db = new LocalStore();
                expect(db.server).be.an.instanceOf(LocalStoreServer);
            });
        });

        describe("start()", () => {
            it("should return ChildProcess object", () => {
                const db = new LocalStore();
                return db.start().then(() => {
                    expect(db.server.process).to.be.instanceOf(ChildProcess);
                    return db.kill();
                }).catch(err => {
                    return db.kill().then(() => {
                        throw err;
                    });
                });
            });
        });

        describe("kill()", () => {
            it("should return kill the running process", () => {
                const db = new LocalStore();
                return db.start().then(() => {
                    return db.kill();
                }).then(() => {
                    expect(db.server.process).to.be.equal(null);                    
                }).catch(err => {
                    return db.kill().then(() => {
                        throw err;
                    });
                });
            });
        });

        describe("test()", () => {
            it("should start server and test schema operations", () => {
                const db = new LocalStore();
                return db.start().then(() => {
                    return db.test();                    
                }).then(result => {
                    expect(result).to.be.equal(true);
                    return db.kill();                  
                }).catch(err => {
                    return db.kill().then(() => {
                        throw err;
                    });
                });
            });
            it("should start server and test schema and data operations", () => {
                const db = new LocalStore();
                return db.start().then(() => {
                    return db.test(true);                    
                }).then(result => {
                    expect(result).to.be.equal(true);    
                    return db.kill();                
                }).catch(err => {
                    return db.kill().then(() => {
                        throw err;
                    });
                });
            });
        });

        describe("ready", () => {
            it("should not be ready until server is started", () => {
                const db = new LocalStore();
                expect(db.ready).to.be.equal(false);
            });
            it("should be ready after server is started", () => {
                const db = new LocalStore();
                return db.start().then(() => {
                    expect(db.ready).to.be.equal(true);
                    return db.kill();
                }).catch(err => {
                    return db.kill().then(() => {
                        throw err;
                    });
                });
            });
        });

    });
}); 