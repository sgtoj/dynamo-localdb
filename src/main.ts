import * as fs from "fs";
import * as path from "path";
import { LocalStoreClient, LSAWSConfig, LSTableConfig, LSDataConfig } from "./client";
import { LocalStoreServer, LSDynamoDBConfig } from "./server";

const testTableConfig = require("../data/tmptable");
const defaultConfig = require("../data/defaults");

export interface LocalStoreConfig {
    client?: LSAWSConfig | null;
    server?: LSDynamoDBConfig | null;
    schemas: LSTableConfig[] | null;
    data: LSDataConfig | null;
};

export class LocalStore {
    private client: LocalStoreClient;
    private server: LocalStoreServer;
    private config: LocalStoreConfig;

    /**
     * Creates an instance of LocalStore.
     * 
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     * 
     * @memberOf LocalStore
     */
    constructor(config: LocalStoreConfig) {
        config = config || {};
        this.config = {} as LocalStoreConfig;
        this.config.client = config.client || null;
        this.config.server = config.server || null;
        this.config.schemas = config.schemas || null;
        this.config.data   = config.data || null;

        if (!!config.schemas  && !Array.isArray(config.schemas))
            throw new Error("Incorrect input for schema. Must be null, undefined, or LSTableConfig[]");

        if (!!config.data && typeof config.data !== "object")
            throw new Error("Incorrect input for schema. Must be null, undefined, or LSDataConfig object");

        this.client = new LocalStoreClient(this.config.client);
        this.server = new LocalStoreServer(this.config.server);
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

    public async load(): Promise<void> {
        if (!this.ready)
            throw new Error("DynamoDB server is not running.");

        if (!!this.config.schemas) {
            let creates = this.config.schemas.map(t => {
                return this.client.create(t);
            });
            await Promise.all(creates);
        }

        if (!!this.config.data) {
            let inserts: Promise<void>[] = [];
            for (let table in this.config.data) {
                inserts.push(this.client.insert(table, this.config.data[table]));
            }
            await Promise.all(inserts);
        }
    }

    public async reload(dropAll: boolean = true): Promise<void> {
        if (!this.ready)
            throw new Error("DynamoDb server is not running.");

        let existingTables = await this.client.list();
        let tablesToDrop = existingTables.filter(t => {
            if (dropAll || !this.config.schemas) return true;
            return this.config.schemas.some(s => {
                return s.TableName === t;
            });
        });
        let drops = tablesToDrop.map(t => {
            return this.client.drop(t);
        });

        await Promise.all(drops);
        await this.load();
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



