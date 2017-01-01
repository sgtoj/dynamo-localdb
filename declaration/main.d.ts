import * as AWS from "aws-sdk";
export interface LocalStoreDataConfig {
    TableName: string;
    Item: any;
}
export interface LSItem {
    [key: string]: AWS.DynamoDB.AttributeValue;
}
export declare class LocalStore {
    private spawn;
    private testTable;
    private db;
    private client;
    /**
     *
     *
     * @type {LocalStoreSchema}
     * @memberOf LocalStore
     */
    schema: LocalStoreSchema;
    /**
     *
     *
     * @type {LocalStoreData}
     * @memberOf LocalStore
     */
    data: LocalStoreData;
    /**
     * Creates an instance of LocalStore.
     *
     * @param {any} config
     *
     * @memberOf LocalStore
     */
    constructor(config: any);
    /**
     *
     *
     * @readonly
     * @private
     * @type {ChildProcess}
     * @memberOf LocalStore
     */
    private readonly process;
    /**
     *
     *
     * @param {any} configuration
     *
     * @memberOf LocalStore
     */
    config(configuration: any): void;
    /**
     *
     *
     * @param {number} [port=8000]
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    launch(port?: number): Promise<void>;
    /**
     *
     *
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    kill(): Promise<void>;
    /**
     *
     *
     * @returns {Promise<boolean>}
     * !!
     * @memberOf LocalStore
     */
    test(extended?: boolean): Promise<boolean>;
    testData(table: string, tableData: any): Promise<boolean>;
    testSchema(table: string): Promise<boolean>;
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
     *
     *
     * @param {any} tableSchema
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreSchema
     */
    create(tableSchema: any): Promise<void>;
    /**
     *
     *
     * @param {string} tableName
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreSchema
     */
    delete(tableName: string): Promise<void>;
    /**
     *
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
     *
     *
     * @param {string} table
     * @param {LSItem} data
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreData
     */
    insert(table: string, data: LSItem): Promise<void>;
    /**
     *
     *
     * @param {string} table
     * @param {LSItem[]} data
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreData
     */
    import(table: string, data: LSItem[]): Promise<void>;
    /**
     *
     *
     * @param {string} table
     * @returns {Promise<LSItem[]>}
     *
     * @memberOf LocalStoreData
     */
    read(table: string): Promise<LSItem[]>;
    /**
     *
     *
     * @param {string} table
     * @returns {Promise<number>}
     *
     * @memberOf LocalStoreData
     */
    count(table: string): Promise<number>;
}
