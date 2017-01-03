/// <reference types="node" />
import * as AWS from "aws-sdk";
import { ChildProcess } from "child_process";
export declare type LSAWSConfig = AWS.DynamoDB.ClientConfiguration;
export declare type LSTableConfig = AWS.DynamoDB.CreateTableInput;
export declare type stdio = "pipe" | "ignore" | "inherit";
export declare type LSDynamoDBConfig = {
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
export declare class LocalStore {
    private client;
    private server;
    /**
     * Creates an instance of LocalStore.
     *
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     *
     * @memberOf LocalStore
     */
    constructor();
    private readonly ready;
    /**
     * Starts DynamoDB server instance.
     *
     * @param {number} [port=8000]
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    start(): Promise<void>;
    /**
     * Kill active DynamoDB server instance.
     *
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    kill(): Promise<void>;
    /**
     * Test if connection is active is compable of creating a table.
     *
     * @param {boolean} [extended=false] Test data access too.
     * @returns {Promise<boolean>}
     *
     * @memberOf LocalStore
     */
    test(extended?: boolean): Promise<boolean>;
}
export declare class LocalStoreSchemaClient {
    private db;
    /**
     * Creates an instance of LocalStoreSchema.
     *
     * @param {AWS.DynamoDB} dynamodb
     *
     * @memberOf LocalStoreSchema
     */
    constructor(dynamodb: AWS.DynamoDB);
    /**
     * Create a new schema
     *
     * @param {LSTableConfig} tableSchema
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreSchema
     */
    create(tableSchema: LSTableConfig): Promise<void>;
    /**
     * Delete existing schema
     *
     * @param {string} tableName
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreSchema
     */
    delete(tableName: string): Promise<void>;
    /**
     * List of current tables
     *
     * @returns {Promise<string[]>}
     *
     * @memberOf LocalStoreSchema
     */
    list(): Promise<string[]>;
}
export declare class LocalStoreDataClient {
    private db;
    private client;
    /**
     * Creates an instance of LocalStoreData.
     *
     * @param {AWS.DynamoDB} db
     * @param {AWS.DynamoDB.DocumentClient} client
     *
     * @memberOf LocalStoreData
     */
    constructor(db: AWS.DynamoDB, client: AWS.DynamoDB.DocumentClient);
    /**
     * Insert a new document
     *
     * @param {string} [table] Name of the table
     * @param {LSItem} data
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreData
     */
    insert(table: string, data: LSItem): Promise<void>;
    /**
     * Insert an array of documents
     *
     * @param {string} [table] Name of the table
     * @param {LSItem[]} data
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreData
     */
    import(table: string, data: LSItem[]): Promise<void>;
    /**
     * Retrieves all the content of a table
     *
     * @param {string} table
     * @returns {Promise<LSItem[]>}
     *
     * @memberOf LocalStoreData
     */
    read(table: string): Promise<LSItem[]>;
    /**
     * Number of document in given table
     *
     * @param {string} table
     * @returns {Promise<number>}
     *
     * @memberOf LocalStoreData
     */
    count(table: string): Promise<number>;
}
export declare class LocalStoreClient {
    private _schema;
    private _data;
    private config;
    private testTable;
    private dbClient;
    private dbDocClient;
    /**
     * Creates an instance of LocalStore.
     *
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     *
     * @memberOf LocalStore
     */
    constructor(config?: LSAWSConfig);
    /**
     * Provides data operation methods.
     *
     * @type {LocalStoreData}
     * @memberOf LocalStore
     */
    readonly data: LocalStoreDataClient;
    readonly ready: boolean;
    /**
     * Provides schema operation methods.
     *
     * @type {LocalStoreSchema}
     * @memberOf LocalStore
     */
    readonly schema: LocalStoreSchemaClient;
    /**
     * Configure AWS
     *
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     *
     * @memberOf LocalStore
     */
    configure(config: LSAWSConfig): void;
    /**
     * Test if connection is active is compable of creating a table
     *
     * @param {boolean} [extended=false] Test data access too
     * @returns {Promise<boolean>}
     *
     * @memberOf LocalStore
     */
    test(extended?: boolean): Promise<boolean>;
    private testData(table, tableData);
    private testSchema(table);
    private setup();
}
export declare class LocalStoreServer {
    private _process;
    private config;
    private dynamodb;
    /**
     * Creates an instance of LocalStore.
     *
     * @param {LSDynamoDBConfig} config Configuration options for DynamoDB and its spawned process.
     *
     * @memberOf LocalStore
     */
    constructor(config?: LSDynamoDBConfig);
    /**
     * Active DynamoDB process information.
     *
     * @readonly
     * @public
     * @type {ChildProcess | null}
     * @memberOf LocalStore
     */
    readonly process: ChildProcess | null;
    /**
     * Ready state of the server.
     *
     * @readonly
     * @public
     * @type {boolean}
     * @memberOf LocalStore
     */
    readonly ready: boolean;
    /**
     * Configure AWS
     *
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     *
     * @memberOf LocalStore
     */
    configure(config?: LSDynamoDBConfig): void;
    /**
     * Start DynamoDB instance
     *
     * @param {number} [port=8000]
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    start(): Promise<void>;
    /**
     * Kill active DynamoDB instance
     *
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    kill(): Promise<void>;
}
