import * as AWS from "aws-sdk";
import * as dynamodb from "dynamodb-local";
import { ChildProcess } from "child_process";



export class LocalStore {
    private db: AWS.DynamoDB;
    private client: AWS.DynamoDB.DocumentClient;
    public tables: LocalStoreSchema;
    public data: LocalStoreData;

    constructor(config) {
        this.config(config);
    }

    public config (configuration) {
        AWS.config.update(configuration);
        this.db = new AWS.DynamoDB();
        this.client = new AWS.DynamoDB.DocumentClient();
    }

    public async launch (port = 8000): Promise<ChildProcess> {
        return dynamodb.launch(port, null, ["sharedDb"]);
    }

}

export class LocalStoreSchema {
    private db: AWS.DynamoDB;

    constructor(dynamodb: AWS.DynamoDB) {
        this.db = dynamodb;
    }

    public async create (tableSchema): Promise<AWS.DynamoDB.CreateTableOutput> {
        return new Promise<AWS.DynamoDB.CreateTableOutput>((resolve, reject) => {
            this.db.createTable(tableSchema, (err, data) => {
                if (err) return reject(err); 
                resolve(data);
            });
        });
    }

    public async delete (tableName: string): Promise<AWS.DynamoDB.DeleteTableOutput> {
        return new Promise<AWS.DynamoDB.DeleteTableOutput>((resolve, reject) => {
            let tableConfig = { TableName: tableName };
            this.db.deleteTable(tableConfig, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    public async list (): Promise<AWS.DynamoDB.ListTablesOutput> {
        return new Promise((resolve, reject) => {
            this.db.listTables({}, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

}

export interface LocalStoreDataConfig {
    TableName: string;
    Item: any;
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

    public async add (table, data): Promise<AWS.DynamoDB.PutItemOutput> {
        return new Promise<AWS.DynamoDB.PutItemOutput>((resolve, reject) => {
            let itemData = { TableName: this.tableData, Item: this.tableData }
            this.client.put(itemData, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    public async content (table: string): Promise<AWS.DynamoDB.ScanOutput> {
        return new Promise<AWS.DynamoDB.ScanOutput>((resolve, reject) => {
            let tableInfo = { TableName: this.tableName };
            return this.db.scan(tableInfo, (err, data) => {0
                if (err) return reject(err);
                resolve(data);
            });
        });
    }


}