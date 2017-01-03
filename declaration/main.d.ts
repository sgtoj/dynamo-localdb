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
