module.exports = {
    client: {
        region: "us-east-1",
        endpoint: "http://localhost:8000"
    },
    server: { 
        port: 8000, 
        dir: null, 
        sharedDb: true, 
        stdio: "ignore", 
        deteched: false 
    }
}