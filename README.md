# Tracker Lambdas

This project is used for tracking users on apps

## Initial Setup Instructions

This project has been generated using the `aws-nodejs-typescript` template from
the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/)

* Install serverless package globally   
  `npm install -g serverless`

* Initialize a new serverless project   
  `serverless create --template aws-nodejs-typescript --path docs-ts-lambda`

* Install yarn package manager globally (OPTIONAL)
  `npm install yarn -g`   
  NOTE: this project uses npm to install the node packages


## Get the project up & running

Installation:
- Run `npm install` to install the project dependencies
- Run `sls dynamodb install` to install SLS DynamoDB (THIS ONE IS REQUIRED)

Run Commands
- Run `npm run start` to run the stack locally (Requires DynamoDB)
- Run `sls offline start` to run the stack locally (Requires DynamoDB)

## Test your lambdas

- Run `yarn test` to run all tests (this will automatically spin up an environment with serverless)

Note: Requires AWS Keys locally that have permissions for AWS Cognito & Textract

- Run `yarn pretest && yarn pm2 logs` to set up the stack locally
- Run `yarn pm2kill` to kill the stack locally
- Run the desired test using jest through your IDE

Occasionally a crashing lambda will cause DynamoDB to try to restart when it's already running. Kill the process running on port 8002 

## Deploy your lambdas

Set up your prod vars in the .env file (Cognito)

- Run `npm run deploy` OR `yarn deploy` to deploy this stack to AWS (prod stage specified in node command)
- Run `npm run remove` OR `yarn remove` to remove this stack to AWS (prod stage specified in node command)
- Run `npm version minor -m "Minor Release" && yarn deploy` for tagging & releasing
- Run `sls deploy` to deploy this stack to AWS
- Run `sls remove` to remove this stack from AWS
  - add `--profile otherprofile` as a parameter for profile specific deployments

## Useful mentions

`aws dynamodb scan --table-name ribbontek_visits_test --endpoint-url http://localhost:8002 --region ap-southeast-2`

