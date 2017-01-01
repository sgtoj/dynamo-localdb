import * as AWS from "aws-sdk";
export declare type LSConfig = AWS.DynamoDB.ClientConfiguration;
export declare type LSTableConfig = AWS.DynamoDB.CreateTableInput;
export interface LSItem {
    [key: string]: AWS.DynamoDB.AttributeValue;
}
export declare class LocalStore {
    private spawn;
    private testTable;
    private db;
    private client;
    /**
     * Provides schema operation methods
     *
     * @type {LocalStoreSchema}
     * @memberOf LocalStore
     */
    schema: LocalStoreSchema;
    /**
     * Provides data operation methods
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
    constructor(config: LSConfig);
    /**
     * Active DynamoDB process information
     *
     * @readonly
     * @private
     * @type {ChildProcess}
     * @memberOf LocalStore
     */
    private readonly process;
    /**
     * Configure AWS
     *
     * @param {any} configuration
     *
     * @memberOf LocalStore
     */
    config(configuration: LSConfig): void;
    /**
     * Launch DynamoDB instance
     *
     * @param {number} [port=8000]
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    launch(port?: number): Promise<void>;
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
     *
     *
     * @param {any} tableSchema
     * @returns {Promise<void>}
     *
     * @memberOf LocalStoreSchema
     */
    create(tableSchema: LSTableConfig): Promise<void>;
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
