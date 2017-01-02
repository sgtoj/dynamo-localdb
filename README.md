#### Under development. Not published to NPM yet.

# dynamodb-local

Simple node module that is used to launch and setup a local instance of 
DynamoDB in a development environment. Unlike other NPM dynamodb modules, this
project is more a developer's tool than a simple DynamoDB laucher. As it will
allow those developers, working DynamoDB projects, to quickly setup and reset 
the database.


## Troubleshooting

- By default `stdio` is set to `ignore`. Change it to `inherit` in the configuration options.
- If `mising 'server' JVM...' error, follow these [steps](http://stackoverflow.com/a/18123162/225522) to resolve.