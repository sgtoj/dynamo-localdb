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
     * @param {LocalStoreConfig} config Configration for server, client, schemas and data.
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
    /**
     * Configs the server (schemas and data alike) to the given configuration.
     *
     * @param {boolean} [dropAll=false] Drop all tables.
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    load(): Promise<void>;
    /**
     * Resets the server configuration (schemas and data alike) to the given configuration.
     *
     * @param {boolean} [dropAll=false] Drop all tables.
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    reload(dropAll?: boolean): Promise<void>;
    /**
     * Test if connection is active is compilable of creating a table.
     *
     * @param {boolean} [extended=false] Test data access too.
     * @returns {Promise<boolean>}
     *
     * @memberOf LocalStore
     */
    test(extended?: boolean): Promise<boolean>;
}
