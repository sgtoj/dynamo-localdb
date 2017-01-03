"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const AWS = require("aws-sdk");
const testTableConfig = require("../data/tmptable");
const defaultConfig = require("../data/defaults").client;
class LocalStoreSchemaClient {
    /**
     * Creates an instance of LocalStoreSchema.
     *
     * @param {AWS.DynamoDB} dynamodb
     *
     * @memberOf LocalStoreSchema
     */
    constructor(dynamodb) {
        this.db = dynamodb;
    }
    /**
     * Create a new schema
     *
     * @param {LSTableConfig} tableSchema
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreSchema
     */
    create(tableSchema) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.createTable(tableSchema, (err, data) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        });
    }
    /**
     * Delete existing schema
     *
     * @param {string} tableName
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreSchema
     */
    delete(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let tableConfig = { TableName: tableName };
                this.db.deleteTable(tableConfig, (err, data) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        });
    }
    /**
     * List of current tables
     *
     * @returns {Promise<string[]>}
     *
     * @memberOf LocalStoreSchema
     */
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.listTables({}, (err, data) => {
                    if (err)
                        return reject(err);
                    resolve(data.TableNames);
                });
            });
        });
    }
}
exports.LocalStoreSchemaClient = LocalStoreSchemaClient;
class LocalStoreDataClient {
    /**
     * Creates an instance of LocalStoreData.
     *
     * @param {AWS.DynamoDB} db
     * @param {AWS.DynamoDB.DocumentClient} client
     *
     * @memberOf LocalStoreData
     */
    constructor(db, client) {
        this.db = db;
        this.client = client;
    }
    /**
     * Insert a new document
     *
     * @param {string} [table] Name of the table
     * @param {LSItem} data
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreData
     */
    insert(table, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let itemData = { TableName: table, Item: data };
                this.client.put(itemData, (err, data) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        });
    }
    /**
     * Insert an array of documents
     *
     * @param {string} [table] Name of the table
     * @param {LSItem[]} data
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreData
     */
    import(table, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let inserts = data.map(item => {
                return this.insert(table, item);
            });
            yield Promise.all(inserts);
            return;
        });
    }
    /**
     * Retrieves all the content of a table
     *
     * @param {string} table
     * @returns {Promise<LSItem[]>}
     *
     * @memberOf LocalStoreData
     */
    read(table) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let tableInfo = { TableName: table };
                this.db.scan(tableInfo, (err, data) => {
                    if (err)
                        return reject(err);
                    resolve(data.Items);
                });
            });
        });
    }
    /**
     * Number of document in given table
     *
     * @param {string} table
     * @returns {Promise<number>}
     *
     * @memberOf LocalStoreData
     */
    count(table) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let tableInfo = { TableName: table };
                this.db.scan(tableInfo, (err, data) => {
                    if (err)
                        return reject(err);
                    resolve(data.Count);
                });
            });
        });
    }
}
exports.LocalStoreDataClient = LocalStoreDataClient;
class LocalStoreClient {
    /**
     * Creates an instance of LocalStore.
     *
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     *
     * @memberOf LocalStore
     */
    constructor(config) {
        this.config = config || defaultConfig;
        this.testTable = testTableConfig;
        this.setup();
    }
    /**
     * Provides data operation methods.
     *
     * @type {LocalStoreData}
     * @memberOf LocalStore
     */
    get data() {
        return this._data;
    }
    get ready() {
        return !!this.dbClient && !!this.dbDocClient && !!this.data && !!this.schema;
    }
    /**
     * Provides schema operation methods.
     *
     * @type {LocalStoreSchema}
     * @memberOf LocalStore
     */
    get schema() {
        return this._schema;
    }
    /**
     * Configure AWS
     *
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     *
     * @memberOf LocalStore
     */
    configure(config) {
        this.config = config;
        this.setup();
    }
    /**
     * Test if connection is active is compable of creating a table
     *
     * @param {boolean} [extended=false] Test data access too
     * @returns {Promise<boolean>}
     *
     * @memberOf LocalStore
     */
    test(extended = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = testTableConfig.schemas[0];
            const data = testTableConfig.data[table.TableName];
            yield this.schema.create(table);
            const result = extended ? yield this.testData(table.TableName, data) : yield this.testSchema(table);
            if (result)
                yield this.schema.delete(table.TableName);
            return result;
        });
    }
    testData(table, tableData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.data.import(table, tableData);
            const data = yield this.data.read(table);
            return !!data;
        });
    }
    testSchema(table) {
        return __awaiter(this, void 0, void 0, function* () {
            let tables = yield this.schema.list();
            return tables.some(t => { return t === table; });
        });
    }
    setup() {
        AWS.config.update(this.config);
        this.dbClient = new AWS.DynamoDB();
        this.dbDocClient = new AWS.DynamoDB.DocumentClient();
        this._schema = new LocalStoreSchemaClient(this.dbClient);
        this._data = new LocalStoreDataClient(this.dbClient, this.dbDocClient);
    }
}
exports.LocalStoreClient = LocalStoreClient;
//# sourceMappingURL=client.js.map