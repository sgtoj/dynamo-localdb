"use strict";
let LocalDB = require("../app/main");

let config = require("../data/tmptable");
let db = new LocalDB.LocalStore(config);

db.start().then(() =>{
    console.log(`Database has started.`);
    return db.test(true);
}).then(result => {
    console.log(`Test Passed: ${ result }`);
    return db.load();
}).then(() => {
    return db.client.list();    
}).then(tables => {
    console.log(`Loaded Tables: ${ tables }`);
    return db.kill();
}).then(() => {
    console.log(`Database process has been killed.`);
    process.exit();
}).catch(err => { 
    console.error(err);
    process.exit();    
});