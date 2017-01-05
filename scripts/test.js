"use strict";

let LocalDB = require("../app/main");
let db = new LocalDB.LocalStore(config);

db.start().then(() =>{
    console.log(`Database has started.`);
    return db.test(true);
}).then(result => {
    console.log(`Test Passed: ${ result }`);
    return db.kill();
}).then(() => {
    console.log(`Database process has been killed.`);
    process.exit();
}).catch(err => { 
    console.error(err);
    process.exit();    
});