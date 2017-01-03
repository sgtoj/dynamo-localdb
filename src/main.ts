import { LocalStoreClient } from "./client";
import { LocalStoreServer } from "./server";

const testTableConfig = require("../data/tmptable");
const defaultConfig = require("../data/defaults");

export class LocalStore {
    private client: LocalStoreClient;
    private server: LocalStoreServer;

    /**
     * Creates an instance of LocalStore.
     * 
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     * 
     * @memberOf LocalStore
     */
    constructor() {
        this.client = new LocalStoreClient();
        this.server = new LocalStoreServer();
    }

    private get ready(): boolean {
        return this.client.ready && this.server.ready;
    }

    /**
     * Starts DynamoDB server instance.
     * 
     * @returns {Promise<void>}
     * 
     * @memberOf LocalStore
     */
    public async start (): Promise<void> {
        await this.server.start();
    }

    /**
     * Kill active DynamoDB server instance.
     * 
     * @returns {Promise<void>}
     * 
     * @memberOf LocalStore
     */
    public async kill (): Promise<void> {
        await this.server.kill();
    }

    /**
     * Test if connection is active is compable of creating a table.
     * 
     * @param {boolean} [extended=false] Test data access too.
     * @returns {Promise<boolean>}
     * 
     * @memberOf LocalStore
     */
    public async test (extended: boolean = false): Promise<boolean> {
        if (!this.ready)
            return false;

        return this.client.test(extended);
    }

}



