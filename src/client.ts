import * as AWS from "aws-sdk";

const testTableConfig = require("../data/tmptable");
const defaultConfig = require("../data/defaults").client;

interface LocalStoreDataConfig {
    TableName: string;
    Item: any;
}

export type LSAWSConfig = AWS.DynamoDB.ClientConfiguration;
export type LSTableConfig = AWS.DynamoDB.CreateTableInput;


export interface LSItem {
    [key: string]: AWS.DynamoDB.AttributeValue;
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