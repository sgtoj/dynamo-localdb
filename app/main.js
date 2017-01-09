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
;
class LocalStore {
    /**
     * Creates an instance of LocalStore.
     *
     * @param {LocalStoreConfig} config Configration for server, client, schemas and data.
     *
     * @memberOf LocalStore
     */
    constructor(config) {
        config = config || {};
        this.config = {};
        this.config.client = config.client || null;
        this.config.server = config.server || null;
        this.config.schemas = config.schemas || null;
        this.config.data = config.data || null;
        if (!!config.schemas && !Array.isArray(config.schemas))
            throw new Error("Incorrect input for schema. Must be null, undefined, or LSTableConfig[]");
        if (!!config.data && typeof config.data !== "object")
            throw new Error("Incorrect input for schema. Must be null, undefined, or LSDataConfig object");
        this.client = new client_1.LocalStoreClient(this.config.client);
        this.server = new server_1.LocalStoreServer(this.config.server);
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
     * Configs the server (schemas and data alike) to the given configuration.
     *
     * @param {boolean} [dropAll=false] Drop all tables.
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready)
                throw new Error("DynamoDB server is not running.");
            if (!!this.config.schemas) {
                let creates = this.config.schemas.map(t => {
                    return this.client.create(t);
                });
                yield Promise.all(creates);
            }
            if (!!this.config.data) {
                let inserts = [];
                for (let table in this.config.data) {
                    inserts.push(this.client.insert(table, this.config.data[table]));
                }
                yield Promise.all(inserts);
            }
        });
    }
    /**
     * Resets the server configuration (schemas and data alike) to the given configuration.
     *
     * @param {boolean} [dropAll=false] Drop all tables.
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    reload(dropAll = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready)
                throw new Error("DynamoDb server is not running.");
            let existingTables = yield this.client.list();
            let tablesToDrop = existingTables.filter(t => {
                if (dropAll || !this.config.schemas)
                    return true;
                return this.config.schemas.some(s => {
                    return s.TableName === t;
                });
            });
            let drops = tablesToDrop.map(t => {
                return this.client.drop(t);
            });
            yield Promise.all(drops);
            yield this.load();
        });
    }
    /**
     * Test if connection is active is compilable of creating a table.
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