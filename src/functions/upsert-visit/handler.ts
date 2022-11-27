import constraint from "@functions/upsert-visit/constraint";
import {formatJSONResponse} from "@libs/api-gateway";
import {exceptionResolver} from "@libs/exception-resolver";
import {middyfy} from "@libs/lambda";
import {validateAgainstConstraints} from "@libs/utils";
import {APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {VisitService} from "@services/visit.service";

const upsertVisit: APIGatewayProxyHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.info(JSON.stringify(event, null, 2));
    const origin = event.headers["origin"];
    const referer = event.headers["referer"];
    const userAgent = event.headers["User-Agent"];
    const ipAddress = event.requestContext.identity.sourceIp;
    const data = event.body as any;
    return validateAgainstConstraints(data, constraint)
        .then(_ => new VisitService().visit({...data, ...{origin, referer, userAgent, ipAddress}})
            .then(_ => formatJSONResponse(200, {}))
        )
        .catch(error => exceptionResolver(error));
};

export const main = middyfy(upsertVisit);
