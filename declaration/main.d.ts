import { LSAWSConfig, LSTableConfig, LSDataConfig } from "./client";
import { LSDynamoDBConfig } from "./server";
export interface LocalStoreConfig {
    client?: LSAWSConfig | null;
    server?: LSDynamoDBConfig | null;
    schemas: LSTableConfig[] | null;
    data: LSDataConfig | null;
}
export declare class LocalStore {
    private client;
    private server;
    private config;
    /**
     * Creates an instance of LocalStore.
     *
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     *
     * @memberOf LocalStore
     */
    constructor(config: LocalStoreConfig);
    private readonly ready;
    /**
     * Starts DynamoDB server instance.
     *
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
    load(): Promise<void>;
    reload(dropAll?: boolean): Promise<void>;
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
