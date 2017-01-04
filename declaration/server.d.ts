/// <reference types="node" />
import { ChildProcess } from "child_process";
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
    constructor(config?: LSDynamoDBConfig | null);
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
