import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";
import {dynamodbClient} from "@clients/dynamodb-client";
import {dynamoDbDocClient} from "@libs/dynamodb-utils";
import {count, getItem, putItem, updateItem} from "@libs/repository-utils";
import {handleRepoError} from "@libs/utils";
import {VisitEntity} from "@repos/visit-entity";

export class VisitRepository {

    constructor(private readonly dynamodbDocClient: DynamoDBDocumentClient = dynamoDbDocClient(dynamodbClient())) {
    }

    public createVisit = async (visitEntity: VisitEntity): Promise<void> => {
        console.info(`Create new VisitEntity ${JSON.stringify(visitEntity)} for table ${process.env.VISIT_TABLE}`);
        const params = {
            TableName: process.env.VISIT_TABLE,
            Item: visitEntity
        };
        return putItem<VisitEntity>(this.dynamodbDocClient, params)
            .then(_ => Promise.resolve())
            .catch(error => handleRepoError(error));
    };

    public updateVisit = async (visitEntity: VisitEntity): Promise<void> => {
        console.info(`Update VisitEntity ${JSON.stringify(visitEntity)} for table ${process.env.VISIT_TABLE}`);
        const pk = 'trackerId';
        const itemKeys = Object.keys(visitEntity).filter(k => k !== 'trackerId');
        const params = {
            TableName: process.env.VISIT_TABLE,
            Key: {
                [pk]: visitEntity[pk]
            },
            UpdateExpression: `SET ${itemKeys.map((_k, index) => `#field${index} = :value${index}`).join(', ')}`,
            ExpressionAttributeValues: itemKeys.reduce((accumulator, k, index) => ({
                ...accumulator,
                [`:value${index}`]: !!visitEntity[k] ? visitEntity[k] : null
            }), {}),
            ExpressionAttributeNames: itemKeys.reduce((accumulator, k, index) => ({
                ...accumulator,
                [`#field${index}`]: k
            }), {}),
            ReturnValues: "ALL_NEW"
        };
        console.info(JSON.stringify(params, null, 2))
        return updateItem<VisitEntity>(this.dynamodbDocClient, params)
            .then(_ => Promise.resolve())
            .catch(error => handleRepoError(error));
    };

    public getVisitsByTrackerId = async (trackerId: string): Promise<VisitEntity | null> => {
        console.info(`Get visits by trackerId ${trackerId} for table ${process.env.VISIT_TABLE}`);
        const params = {
            Key: {trackerId},
            TableName: process.env.VISIT_TABLE
        };
        return getItem<VisitEntity | null>(this.dynamodbDocClient, params)
            .then(data => !!data.Item ? data.Item : null)
            .catch(error => handleRepoError(error));
    };

    public getVisitsByBlogId = async (blogId: string): Promise<number | null> => {
        console.info(`Get visits by blogId ${blogId} for table ${process.env.VISIT_TABLE}`);
        const params = {
            FilterExpression: "contains(blogIds, :blogId)",
            ExpressionAttributeValues: {
                ":blogId": blogId
            },
            TableName: process.env.VISIT_TABLE
        };
        return count(this.dynamodbDocClient, params)
            .then(data => data.Count)
            .catch(error => handleRepoError(error));
    };
}
