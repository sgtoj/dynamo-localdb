import * as AWS from "aws-sdk";
import * as dynamodb from "dynamodb-local";
import { ChildProcess } from "child_process";

const testTable = require("../data/test");


export class LocalStore {
    private testTable: any;
    private db: AWS.DynamoDB;
    private client: AWS.DynamoDB.DocumentClient;
    public schema: LocalStoreSchema;
    public tables: LocalStoreData;

    constructor(config) {
        this.config(config);
        this.testTable = testTable;
    }

    public config (configuration): void {
        AWS.config.update(configuration);
        this.db = new AWS.DynamoDB();
        this.client = new AWS.DynamoDB.DocumentClient();
        this.schema = new LocalStoreSchema(this.db);
    }

    public async launch (port = 8000): Promise<ChildProcess> {
        return dynamodb.launch(port, null, ["sharedDb"]);
    }

    public async test (): Promise<boolean> {
        await this.schema.create(testTable.schemas[0]);
        let tables = await this.schema.list();
        return tables.some(table => {
            return table === testTable.schemas[0].TableName;
        });
    }

}

export class LocalStoreSchema {
    private db: AWS.DynamoDB;

    constructor(dynamodb: AWS.DynamoDB) {
        this.db = dynamodb;
    }
 
    public async create (tableSchema): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.createTable(tableSchema, (err, data) => {
                if (err) return reject(err); 
                resolve();
            });
        });
    }

    public async delete (tableName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let tableConfig = { TableName: tableName };
            this.db.deleteTable(tableConfig, (err, data) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    public async list (): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.db.listTables({}, (err, data) => {
                if (err) return reject(err);
                resolve(data.TableNames);
            });
        });
    }

}

export interface LocalStoreDataConfig {
    TableName: string;
    Item: any;
}

export interface LSItem {
    [key: string]: AWS.DynamoDB.AttributeValue;
}

export class LocalStoreData {
    private db: AWS.DynamoDB;
    private client: AWS.DynamoDB.DocumentClient;
    private tableName:  string;
    private tableData: any;

    constructor(table: string, data: any, db: AWS.DynamoDB, client: AWS.DynamoDB.DocumentClient) {
        this.db = db;
        this.client = client;
        this.tableName = table;
        this.tableData = data;
    }

    public async add (data): Promise<void> {
        this.tableData = data;        
        return new Promise<void>((resolve, reject) => {
            let itemData = { TableName: this.tableData, Item: this.tableData }
            this.client.put(itemData, (err, data) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    public async items (): Promise<LSItem[]> {
        return new Promise<LSItem[]>((resolve, reject) => {
            let tableInfo = { TableName: this.tableName };
            return this.db.scan(tableInfo, (err, data) => {0
                if (err) return reject(err);
               resolve(data.Items);
            });
        });
    }

    public async count (): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            let tableInfo = { TableName: this.tableName };
            return this.db.scan(tableInfo, (err, data) => {0
                if (err) return reject(err);
                resolve(data.Count);
            });
        });
    }


}