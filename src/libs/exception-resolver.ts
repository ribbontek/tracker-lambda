import {formatJSONResponse} from "@libs/api-gateway";
import {ApiException, BadRequestException} from "@models/exception.model";

export const exceptionResolver = (error: Error) => {
    console.error("Resolving error", error instanceof Error)
    if (error instanceof ApiException) {
        return formatJSONResponse(500, {message: error.message});
    } else if (error instanceof BadRequestException) {
        return formatJSONResponse(400, {message: error.message});
    } else {
        return formatJSONResponse(400, {message: "Bad Request"});
    }
};
