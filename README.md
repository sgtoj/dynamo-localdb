#### Under development. Not published to NPM yet.

# dynamo-localdb

Simple node module that is used to launch and setup a local instance of 
DynamoDB in a development environment. Unlike other NPM dynamodb modules, this
project is more a developer's tool than a simple DynamoDB launcher. As it will
allow those developers, working DynamoDB projects, to quickly setup and reset 
the database.

## Instructions

### Examples 


## Troubleshooting

- Change server process `stdio` setting to `inherit` so that stderr pipes to the console.
  - By default server process `stdio`, is set to `ignore`. 
- Error: `missing 'server' JVM...' error 
  - Follow these [steps](http://stackoverflow.com/a/18123162/225522) to resolve.