let LocalDB = require("../app/main");

let config = {
    "region": "us-east-1",
    "endpoint": "http://localhost:8000"
}

let db = new LocalDB.LocalStore(config);
db.launch();
