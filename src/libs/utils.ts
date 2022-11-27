import {setUpCustomValidators} from "@libs/validate-ext";
import {validate} from "validate.js";
import {ApiException} from "@models/exception.model";

export type IGeneric<T> = {
    [index in string | number | any]: T;
};

export const validateAgainstConstraints = (values: IGeneric<string | number | any>, constraints: IGeneric<object>) => {
    setUpCustomValidators();
    return new Promise<void>((resolve, reject) => {
        const result = validate(values, constraints);
        validate(values, constraints); // HACK
        if (typeof result === "undefined") {
            console.info("Request validated");
            resolve();
        } else {
            console.error("Failed Request Validation >>", result);
            reject(Error("Invalid request fields"));
        }
    });
};

export const handleRepoError = (error: Error) => {
    console.error(`Error: ${error.message}`);
    throw new Error(`Error: ${error.message}`);
};

export const handleApiError = (error: Error) => {
    if (error instanceof ApiException) {
        throw error;
    } else {
        console.error(`Api Exception Error: ${error.message}`);
        throw new ApiException("Something went wrong!");
    }
};

export const undefinedToNull = (field: any) => {
    return !!field ? field : null;
}
