import {formatJSONResponse} from "@libs/api-gateway";
import {middyfy} from "@libs/lambda";
import {APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";

const healthCheck: APIGatewayProxyHandler = async (_event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    return formatJSONResponse(200, {status: "UP"});
};

export const main = middyfy(healthCheck);
