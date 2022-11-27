import {formatJSONResponse} from "@libs/api-gateway";
import {exceptionResolver} from "@libs/exception-resolver";
import {middyfy} from "@libs/lambda";
import {validateAgainstConstraints} from "@libs/utils";
import {APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {VisitService} from "@services/visit.service";
import constraint from "@functions/get-blog-visits/constraint";

const getBlogVisits: APIGatewayProxyHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.info(JSON.stringify(event, null, 2));
    const {blogId} = event.pathParameters;
    return validateAgainstConstraints({blogId}, constraint)
        .then(_ => new VisitService().getVisitsByBlogId({blogId})
            .then(data => formatJSONResponse(200, data))
        )
        .catch(error => exceptionResolver(error));
};

export const main = middyfy(getBlogVisits);
