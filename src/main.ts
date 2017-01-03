import * as AWS from "aws-sdk";
import * as dynamodb from "local-dynamo";
import { ChildProcess } from "child_process";

const testTableConfig = require("../data/tmptable");
const defaultConfig = require("../data/defaults");

interface LocalStoreDataConfig {
    TableName: string;
    Item: any;
}

export type LSAWSConfig = AWS.DynamoDB.ClientConfiguration;
export type LSTableConfig = AWS.DynamoDB.CreateTableInput;
export type stdio = "pipe" | "ignore" | "inherit";

export type LSDynamoDBConfig = {
    port: number;
    deteched?: boolean;
    stdio?: stdio | stdio[];
    heap?: string;
    cors?: string | string[];
    sharedDb?: boolean;
    dir?: string | null;
};

export interface LSItem {
    [key: string]: AWS.DynamoDB.AttributeValue;
}

export class LocalStore {
    private client: LocalStoreClient;
    private server: LocalStoreServer;

    /**
     * Creates an instance of LocalStore.
     * 
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     * 
     * @memberOf LocalStore
     */
    constructor() {
        this.client = new LocalStoreClient();
        this.server = new LocalStoreServer();
    }

    private get ready(): boolean {
        return this.client.ready && this.server.ready;
    }

    /**
     * Starts DynamoDB server instance.
     * 
     * @param {number} [port=8000]
     * @returns {Promise<void>}
     * 
     * @memberOf LocalStore
     */
    public async start (): Promise<void> {
        await this.server.start();
    }

    /**
     * Kill active DynamoDB server instance.
     * 
     * @returns {Promise<void>}
     * 
     * @memberOf LocalStore
     */
    public async kill (): Promise<void> {
        await this.server.kill();
    }

    /**
     * Test if connection is active is compable of creating a table.
     * 
     * @param {boolean} [extended=false] Test data access too.
     * @returns {Promise<boolean>}
     * 
     * @memberOf LocalStore
     */
    public async test (extended: boolean = false): Promise<boolean> {
        if (!this.ready)
            return false;

        return this.client.test(extended);
    }

}

export class LocalStoreSchemaClient {
    private db: AWS.DynamoDB;

    /**
     * Creates an instance of LocalStoreSchema.
     * 
     * @param {AWS.DynamoDB} dynamodb
     * 
     * @memberOf LocalStoreSchema
     */
    constructor(dynamodb: AWS.DynamoDB) {
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
    public async create (tableSchema: LSTableConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.createTable(tableSchema, (err, data) => {
                if (err) return reject(err);
                resolve();
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
    public async delete (tableName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let tableConfig = { TableName: tableName };
            this.db.deleteTable(tableConfig, (err, data) => {
                if (err) return reject(err);
                resolve();
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
    public async list (): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.db.listTables({}, (err, data) => {
                if (err) return reject(err);
                resolve(data.TableNames);
            });
        });
    }

}

export class LocalStoreDataClient {
    private db: AWS.DynamoDB;
    private client: AWS.DynamoDB.DocumentClient;

    /**
     * Creates an instance of LocalStoreData.
     * 
     * @param {AWS.DynamoDB} db
     * @param {AWS.DynamoDB.DocumentClient} client
     * 
     * @memberOf LocalStoreData
     */
    constructor(db: AWS.DynamoDB, client: AWS.DynamoDB.DocumentClient) {
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
    public async insert (table: string, data: LSItem): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let itemData: AWS.DynamoDB.PutItemInput = { TableName: table, Item: data };
            this.client.put(itemData, (err, data) => {
                if (err) return reject(err);
                resolve();
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
     public async import (table: string, data: LSItem[]): Promise<void> {
         let inserts = data.map(item => {
             return this.insert(table, item);
         });

         await Promise.all(inserts);
         return;
     }

    /**
     * Retrieves all the content of a table
     * 
     * @param {string} table
     * @returns {Promise<LSItem[]>}
     * 
     * @memberOf LocalStoreData
     */
    public async read (table: string): Promise<LSItem[]> {
        return new Promise<LSItem[]>((resolve, reject) => {
            let tableInfo = { TableName: table };
            this.db.scan(tableInfo, (err, data) => {
                if (err) return reject(err);
                resolve(data.Items);
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
    public async count (table: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            let tableInfo = { TableName: table };
            this.db.scan(tableInfo, (err, data) => {
                if (err) return reject(err);
                resolve(data.Count);
            });
        });
    }

}

export class LocalStoreClient {
    private _schema: LocalStoreSchemaClient;
    private _data: LocalStoreDataClient;
    private config: LSAWSConfig;
    private testTable: any;
    private dbClient: AWS.DynamoDB;
    private dbDocClient: AWS.DynamoDB.DocumentClient;


    /**
     * Creates an instance of LocalStore.
     * 
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     * 
     * @memberOf LocalStore
     */
    constructor(config?: LSAWSConfig) {
        this.config = config || defaultConfig.client;
        this.testTable = testTableConfig;
        this.setup();
    }

    /**
     * Provides data operation methods. 
     * 
     * @type {LocalStoreData}
     * @memberOf LocalStore
     */
    public get data(): LocalStoreDataClient {
        return this._data;
    }

    public get ready(): boolean {
        return !!this.dbClient && !!this.dbDocClient && !!this.data && !!this.schema;
    }

    /**
     * Provides schema operation methods.
     * 
     * @type {LocalStoreSchema}
     * @memberOf LocalStore
     */
    public get schema(): LocalStoreSchemaClient {
        return this._schema;
    }

    /**
     * Configure AWS
     * 
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     * 
     * @memberOf LocalStore
     */
    public configure (config: LSAWSConfig): void {
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
    public async test (extended: boolean = false): Promise<boolean> {
        const table = testTableConfig.schemas[0];
        const data = testTableConfig.data[table.TableName];
        await this.schema.create(table);
        const result = extended ? await this.testData(table.TableName, data) : await this.testSchema(table);
        if (result)
             await this.schema.delete(table.TableName);
        return result;
    }

    private async testData(table: string, tableData: LSItem[]): Promise<boolean> {
        await this.data.import(table, tableData);
        const data = await this.data.read(table);
        return !!data;
    }

    private async testSchema(table: string): Promise<boolean> {
        let tables = await this.schema.list();
        return tables.some(t => { return t === table; });
    }

    private setup() {
        AWS.config.update(this.config);
        this.dbClient = new AWS.DynamoDB();
        this.dbDocClient = new AWS.DynamoDB.DocumentClient();
        this._schema = new LocalStoreSchemaClient(this.dbClient);
        this._data = new LocalStoreDataClient(this.dbClient, this.dbDocClient);
    }

}

export class LocalStoreServer {
    private _process: ChildProcess | null;
    private config: LSDynamoDBConfig;
    private dynamodb: dynamodb;

    /**
     * Creates an instance of LocalStore.
     * 
     * @param {LSDynamoDBConfig} config Configuration options for DynamoDB and its spawned process.
     * 
     * @memberOf LocalStore
     */
    constructor(config?: LSDynamoDBConfig) {
        this.dynamodb = dynamodb;
        this.config = config || defaultConfig.server;
        this.configure(config);
    }

    /**
     * Active DynamoDB process information.
     * 
     * @readonly
     * @public
     * @type {ChildProcess | null}
     * @memberOf LocalStore
     */
    public get process(): ChildProcess | null {
        if (!!this._process)
            return this._process;
        return null;
    }

    /**
     * Ready state of the server.
     * 
     * @readonly
     * @public
     * @type {boolean}
     * @memberOf LocalStore
     */
    public get ready(): boolean {
        return !!this.dynamodb && !!this.process;
    }

    /**
     * Configure AWS
     * 
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     * 
     * @memberOf LocalStore
     */
    public configure (config?: LSDynamoDBConfig): void {
        if (!!config)
            this.config = config;
    }

    /**
     * Start DynamoDB instance
     * 
     * @param {number} [port=8000]
     * @returns {Promise<void>}
     * 
     * @memberOf LocalStore
     */
    public async start (): Promise<void> {
        const self = this;
        await new Promise<void> ((resolve, reject) => {
            try {
                self._process = this.dynamodb.launch(this.config);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Kill active DynamoDB instance
     * 
     * @returns {Promise<void>}
     * 
     * @memberOf LocalStore
     */
    public async kill (): Promise<void> {
        if (!!this._process)
            await this._process.kill();
        this._process = null;
    }
}
