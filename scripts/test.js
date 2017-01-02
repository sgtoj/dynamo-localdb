"use strict";
let LocalDB = require("../app/main");

let config = {
    "region": "us-east-1",
    "endpoint": "http://localhost:8000"
}

process.on("error", err => {
    console.error(err);
});


let db = new LocalDB.LocalStore(config);

db.launch().then(() =>{
    console.log(`Database has started.`);
    return db.test(true);
}).then(result => {
    console.log(`Test Passed: ${ result }`);
}).then(() => {
    return db.kill();
}).then(() => {
    console.log(`Database process has been killed.`);
    process.exit();
}).catch(err => { 
    console.error(err);
    process.exit();    
});