import polling from "light-async-polling";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";
import {dynamoDbDocClient} from "@libs/dynamodb-utils";
import {dynamodbClient} from "@clients/dynamodb-client";
import {count} from "@libs/repository-utils";
import axios from "axios";

export const SLS_LOCALHOST = "http://localhost:3000";
export const GREAT_SUCCESS = 200;
export const APPLICATION_JSON = {headers: {contentType: "application/json"}};

export const dynamodbReady = async (): Promise<Boolean> => {
    const dynamodbDocClient: DynamoDBDocumentClient = dynamoDbDocClient(dynamodbClient())
    const start = Date.now();
    const asyncFn = async () => {
        console.info(`Scanning ${process.env.VISIT_TABLE}`)
        const millis = Date.now() - start;
        return await count(dynamodbDocClient, {TableName: process.env.VISIT_TABLE})
            .then(res => res.$metadata.httpStatusCode == GREAT_SUCCESS || Math.floor(millis / 1000) > 10)
            .catch(_ => Math.floor(millis / 1000) > 10);
    };
    return polling(asyncFn, 1000);
};

export const serverlessReady = async (): Promise<Boolean> => {
    const start = Date.now();
    const asyncFn = async () => {
        console.info(`Scanning ${process.env.VISIT_TABLE}`)
        const millis = Date.now() - start;
        return await axios.get(SLS_LOCALHOST + '/test/v1/health', APPLICATION_JSON)
            .then(res => res.status == GREAT_SUCCESS)
            .catch(_ => Math.floor(millis / 1000) > 10);
    };
    return polling(asyncFn, 1000);
};

export const customFail = (message) => {
    throw new Error(message);
}
