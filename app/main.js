"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const client_1 = require("./client");
const server_1 = require("./server");
const testTableConfig = require("../data/tmptable");
const defaultConfig = require("../data/defaults");
class LocalStore {
    /**
     * Creates an instance of LocalStore.
     *
     * @param {LSAWSConfig} awsConfig Configuration options for the local AWS client.
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     *
     * @memberOf LocalStore
     */
    constructor() {
        this.client = new client_1.LocalStoreClient();
        this.server = new server_1.LocalStoreServer();
    }
    get ready() {
        return this.client.ready && this.server.ready;
    }
    /**
     * Starts DynamoDB server instance.
     *
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.server.start();
        });
    }
    /**
     * Kill active DynamoDB server instance.
     *
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    kill() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.server.kill();
        });
    }
    /**
     * Test if connection is active is compable of creating a table.
     *
     * @param {boolean} [extended=false] Test data access too.
     * @returns {Promise<boolean>}
     *
     * @memberOf LocalStore
     */
    test(extended = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready)
                return false;
            return this.client.test(extended);
        });
    }
}
exports.LocalStore = LocalStore;
//# sourceMappingURL=main.js.map