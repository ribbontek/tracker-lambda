import type {AWS} from '@serverless/typescript';
import {functions} from "@functions/index";

const serverlessConfiguration: AWS = {
    service: 'tracker-lambda',
    frameworkVersion: '3',
    plugins: [
        'serverless-esbuild',
        "serverless-dynamodb-local",
        "serverless-offline"
    ],
    useDotenv: true,
    provider: {
        name: 'aws',
        runtime: 'nodejs14.x',
        // @ts-ignore
        region: "${self:custom.region, 'ap-southeast-2'}",
        stage: "${opt:stage, 'dev'}",
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
            SYS_ENV: "${self:provider.stage}",
            VISIT_TABLE: "${file(./config.${self:provider.stage}.json):visitsDynamoDbTable, 'ribbontek_visits_test'}"
        },
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: ["dynamodb:*"],
                Resource: {"Fn::GetAtt": ["VisitsTable", "Arn"]}
            }, {
                Effect: "Allow",
                Action: ["cloudwatch:*"],
                Resource: "*"
            },
        ]
    },
    // import the function via paths
    functions: functions,
    package: {individually: true},
    custom: {
        region: "${opt:region, file(./config.${self:provider.stage}.json):region, 'ap-southeast-2'}",
        stage: "${opt:stage, self:provider.stage}",
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ['aws-sdk'],
            target: 'node14',
            define: {'require.resolve': undefined},
            platform: 'node',
            concurrency: 10,
        },
        dynamodb: {
            stages: ["dev", "test"],
            start: {
                port: 8002,
                inMemory: true,
                heapInitial: "200m",
                heapMax: "1g",
                seed: true,
                migrate: true,
                convertEmptyValues: true
            },
        },
        table_throughputs: {
            prod: 5,
            default: 1,
        },
        table_throughput: "${self:custom.table_throughputs.${self:custom.stage}, self:custom.table_throughputs.default}",
    },
    resources: {
        Resources: {
            VisitsTable: {
                Type: "AWS::DynamoDB::Table",
                DeletionPolicy: "Retain",
                Properties: {
                    TableName: "${self:provider.environment.VISIT_TABLE}",
                    AttributeDefinitions: [
                        {AttributeName: "trackerId", AttributeType: "S"}
                    ],
                    KeySchema: [
                        {AttributeName: "trackerId", KeyType: "HASH"},
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: "${self:custom.table_throughput}",
                        WriteCapacityUnits: "${self:custom.table_throughput}"
                    }
                }
            }
        }
    }
};

module.exports = serverlessConfiguration;
