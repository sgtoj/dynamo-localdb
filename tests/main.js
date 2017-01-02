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
    const testConfig = require("../data/testconfig");

    describe("LocalStore", () => {

        const LocalStore = LocalDB.LocalStore;

        describe("constructor()", () => {
            it("should create an instance of itself", () => {
                const db = new LocalStore(testConfig);
                expect(db).be.an.instanceOf(LocalStore);
            });
        });

        describe("config()", () => {
            it("should set the private db, client, schema, and data property when called", () => {
                const db = new LocalStore();
                db.config(testConfig);
                expect(db.ready).to.be.equal(true);
            });s
        });

        describe("ready", () => {
            it("should be immedately ready when config is pass at the start", () => {
                const db = new LocalStore(testConfig);
                expect(db.ready).to.be.equal(true);
            });
            
            it("should not be ready ready after setting config", () => {
                const db = new LocalStore();
                expect(db.ready).to.be.equal(false);
            });
        });

        describe("process", () => {
            it("should return null before launch() is called", () => {
                const db = new LocalStore(testConfig);
                const proc = db.process;
                expect(proc).to.be.equal(null);
            });
            it("should return ChildProcess object", () => {
                const ChildProcess = require("child_process").ChildProcess;
                const db = new LocalStore(testConfig);
                const output = db.launch();
                expect(db.process).to.be.instanceOf(ChildProcess);
            });
        });
    });
}); 