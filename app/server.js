"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const dynamodb = require("local-dynamo");
const defaultConfig = require("../data/defaults").server;
class LocalStoreServer {
    /**
     * Creates an instance of LocalStore.
     *
     * @param {LSDynamoDBConfig} config Configuration options for DynamoDB and its spawned process.
     *
     * @memberOf LocalStore
     */
    constructor(config) {
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
    get process() {
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
    get ready() {
        return !!this.dynamodb && !!this.process;
    }
    /**
     * Configure AWS
     *
     * @param {LSDynamoDBConfig} dbConfig Configuration options for DynamoDB and its spawned process.
     *
     * @memberOf LocalStore
     */
    configure(config) {
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
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            yield new Promise((resolve, reject) => {
                try {
                    self._process = this.dynamodb.launch(this.config);
                    resolve();
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    /**
     * Kill active DynamoDB instance
     *
     * @returns {Promise<void>}
     *
     * @memberOf LocalStore
     */
    kill() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this._process)
                yield this._process.kill();
            this._process = null;
        });
    }
}
exports.LocalStoreServer = LocalStoreServer;
//# sourceMappingURL=server.js.map