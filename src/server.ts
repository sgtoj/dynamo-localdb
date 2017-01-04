import * as dynamodb from "local-dynamo";
import { ChildProcess } from "child_process";

const defaultConfig = require("../data/defaults").server;

export type stdio = "pipe" | "ignore" | "inherit";

export type LSDynamoDBConfig = {
    port: number;
    deteched?: boolean;
    stdio?: stdio | stdio[];
    heap?: string;
    cors?: string | string[];
    sharedDb?: boolean;
    dir?: string | null;
};

export class LocalStoreServer {
    private _process: ChildProcess | null;
    private config: LSDynamoDBConfig;
    private dynamodb: dynamodb;

    /**
     * Creates an instance of LocalStore.
     * 
     * @param {LSDynamoDBConfig} config Configuration options for DynamoDB and its spawned process.
     * 
     * @memberOf LocalStore
     */
    constructor(config?: LSDynamoDBConfig | null) {
        this.dynamodb = dynamodb;
        this.config = config || defaultConfig;
        this.configure(this.config);
    }

    /**
     * Active DynamoDB process information.
     * 
     * @readonly
     * @public
     * @type {ChildProcess | null}
     * @memberOf LocalStore
     */
    public get process(): ChildProcess | null {
        if (!!this._process)
            return this._process;
        return null;
    }

    /**
     * Ready state of the server.
     * 
     * @readonly
     * @public
     * @type {boolean}
     * @memberOf LocalStore
     */
    public get ready(): boolean {
        return !!this.dynamodb && !!this.process;
    }

    /**
     * Configure AWS
     * 
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     * 
     * @memberOf LocalStore
     */
    public configure (config?: LSDynamoDBConfig): void {
        if (!!config)
            this.config = config;
    }

    /**
     * Start DynamoDB instance
     * 
     * @param {number} [port=8000]
     * @returns {Promise<void>}
     * 
     * @memberOf LocalStore
     */
    public async start (): Promise<void> {
        const self = this;
        await new Promise<void> ((resolve, reject) => {
            try {
                self._process = this.dynamodb.launch(this.config);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
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
}
