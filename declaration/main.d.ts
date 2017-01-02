import * as AWS from "aws-sdk";
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
    private _schema;
    private _data;
    private _process;
    private dbConfig;
    private testTable;
    private db;
    private client;
    /**
     * Creates an instance of LocalStore.
     *
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     *
     * @memberOf LocalStore
     */
    constructor(awsConfig: LSAWSConfig, dbConfig?: LSDynamoDBConfig);
    /**
     * Provides data operation methods.
     *
     * @type {LocalStoreData}
     * @memberOf LocalStore
     */
    readonly data: LocalStoreData;
    /**
     * Active DynamoDB process information.
     *
     * @readonly
     * @private
     * @type {ChildProcess}
     * @memberOf LocalStore
     */
    private readonly process;
    private readonly ready;
    /**
     * Provides schema operation methods.
     *
     * @type {LocalStoreSchema}
     * @memberOf LocalStore
     */
    readonly schema: LocalStoreSchema;
    /**
     * Configure AWS
     *
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     *
     * @memberOf LocalStore
     */
    config(awsConfig: LSAWSConfig, dbConfig?: LSDynamoDBConfig): void;
    /**
     * Launch DynamoDB instance
     *
     * @param {number} [port=8000]
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    launch(): Promise<void>;
    /**
     * Kill active DynamoDB instance
     *
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    kill(): Promise<void>;
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
}
export declare class LocalStoreSchema {
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
     * @param {any} tableSchema
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
export declare class LocalStoreData {
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
