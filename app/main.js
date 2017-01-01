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
const dynamodb = require("dynamodb-local");
const testTableConfig = require("../data/tmptable");
class LocalStore {
    /**
     * Creates an instance of LocalStore.
     *
     * @param {any} config
     *
     * @memberOf LocalStore
     */
    constructor(config) {
        if (!!config)
            this.config(config);
        this.testTable = testTableConfig;
    }
    /**
     * Provides data operation methods
     *
     * @type {LocalStoreData}
     * @memberOf LocalStore
     */
    get data() {
        return this._data;
    }
    /**
     * Active DynamoDB process information
     *
     * @readonly
     * @private
     * @type {ChildProcess}
     * @memberOf LocalStore
     */
    get process() {
        if (!!this._process)
            return this._process;
        return null;
    }
    get ready() {
        return !!this.db && !!this.client && !!this.data && !!this.schema;
    }
    /**
     * Provides schema operation methods
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
     * @param {any} configuration
     *
     * @memberOf LocalStore
     */
    config(configuration) {
        AWS.config.update(configuration);
        this.db = new AWS.DynamoDB();
        this.client = new AWS.DynamoDB.DocumentClient();
        this._schema = new LocalStoreSchema(this.db);
        this._data = new LocalStoreData(this.db, this.client);
    }
    /**
     * Launch DynamoDB instance
     *
     * @param {number} [port=8000]
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    launch(port = 8000) {
        return __awaiter(this, void 0, void 0, function* () {
            this._process = yield dynamodb.launch(port, null, ["sharedDb"]);
        });
    }
    /**
     * Kill active DynamoDB instance
     *
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    kill() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this._process)
                yield this._process.kill();
            this._process = null;
        });
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
                yield this.schema.delete(table);
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
}
exports.LocalStore = LocalStore;
class LocalStoreSchema {
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
     * @param {any} tableSchema
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
exports.LocalStoreSchema = LocalStoreSchema;
class LocalStoreData {
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
                return this.db.scan(tableInfo, (err, data) => {
                    0;
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
                return this.db.scan(tableInfo, (err, data) => {
                    0;
                    if (err)
                        return reject(err);
                    resolve(data.Count);
                });
            });
        });
    }
}
exports.LocalStoreData = LocalStoreData;
//# sourceMappingURL=main.js.map