import * as AWS from "aws-sdk";
import * as dynamodb from "dynamodb-local";
import { ChildProcess } from "child_process";

const testTableConfig = require("../data/tmptable");

export type LSConfig = AWS.DynamoDB.ClientConfiguration;
export type LSTableConfig = AWS.DynamoDB.CreateTableInput;

interface LocalStoreDataConfig {
    TableName: string;
    Item: any;
}

export interface LSItem {
    [key: string]: AWS.DynamoDB.AttributeValue;
}

export class LocalStore {
    private _schema: LocalStoreSchema;
    private _data: LocalStoreData;
    private _process: ChildProcess | null;
    private testTable: any;
    private db: AWS.DynamoDB;
    private client: AWS.DynamoDB.DocumentClient;


    /**
     * Creates an instance of LocalStore.
     * 
     * @param {any} config
     * 
     * @memberOf LocalStore
     */
    constructor(config?: LSConfig) {
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
    public get data(): LocalStoreData {
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
    private get process(): ChildProcess | null {
        if (!!this._process)
            return this._process;
        return null;
    }

    private get ready(): boolean {
        return !!this.db && !!this.client && !!this.data && !!this.schema;
    }

    /**
     * Provides schema operation methods
     * 
     * @type {LocalStoreSchema}
     * @memberOf LocalStore
     */
    public get schema(): LocalStoreSchema {
        return this._schema;
    }
    
    /**
     * Configure AWS
     * 
     * @param {any} configuration
     * 
     * @memberOf LocalStore
     */
    public config (configuration: LSConfig): void {
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
    public async launch (port: number = 8000): Promise<void> {
        this._process = await dynamodb.launch(port, null, ["sharedDb"]);
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
             await this.schema.delete(table);
        return result;
    }

    private async testData(table: string, tableData: LSItem[]): Promise<boolean> {
        await this.data.import(table, tableData);
        const data = await this.data.read(table);
        return !!data;
    }

    private async testSchema(table: string): Promise<boolean> {
        let tables = await this.schema.list();
        return tables.some(t => { return t === table });
    }

}

export class LocalStoreSchema {
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
     * @param {any} tableSchema
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

export class LocalStoreData {
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
            let itemData: AWS.DynamoDB.PutItemInput = { TableName: table, Item: data }
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
         return
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
            return this.db.scan(tableInfo, (err, data) => {0
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
            return this.db.scan(tableInfo, (err, data) => {0
                if (err) return reject(err);
                resolve(data.Count);
            });
        });
    }

}