/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../declaration/main.d.ts" />

"use strict";

const expect = require("chai").expect;
const assert = require("chai").assert;

before(done => {
    done();
});

after(done => {
    done();
});

describe("module", () => {
    
    const LocalDB = require("../app/main");
    const tmpTable = require("../data/testconfig");
    const clientConfig = require("../data/testconfig").client;
    const serverConfig = require("../data/testconfig").server;

    describe("LocalStore", () => {

        const LocalStore = LocalDB.LocalStore;

        describe("constructor()", () => {
            it("should create an instance of itself", () => {
                const db = new LocalStore(clientConfig);
                expect(db).be.an.instanceOf(LocalStore);
            });
        });

        describe("ready", () => {
            it("should not be ready until server is started", () => {
                const db = new LocalStore();
                expect(db.ready).to.be.equal(false);
            });
            it("should be ready after server is started", () => {
                const db = new LocalStore();
                db.start().then(() => {
                    expect(db.ready).to.be.equal(false);
                });
            });
        });

    });

    describe("LocalStoreServer", () => {

        const LocalStoreServer = LocalDB.LocalStoreServer;

        describe("configure()", () => {
            it("should set the private db, client, schema, and data property when called", () => {
                const db = new LocalStoreServer();
                db.config(serverConfig);
                expect(db.config).to.be.not.equal(null);
            });
        });

        describe("process", () => {
            it("should return null before launch() is called", () => {
                const svr = new LocalStoreServer(testConfig);
                const proc = svr.process;
                expect(proc).to.be.equal(null);
            });
            it("should return ChildProcess object", () => {
                const ChildProcess = require("child_process").ChildProcess;
                const svr = new LocalStoreServer(testConfig);
                const output = svr.start();
                expect(svr.process).to.be.instanceOf(ChildProcess);
            });
        });

    });
}); 