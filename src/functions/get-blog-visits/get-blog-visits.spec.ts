import axios from "axios";
import {v4 as uuidv4} from "uuid";
import * as crypto from "crypto";
import {APPLICATION_JSON, customFail, dynamodbReady, serverlessReady, SLS_LOCALHOST} from "@test-utils/shared";
import {Page} from "@models/visit.model";

describe("Get Blog Visits Integration Test", () => {
    // set global timeout for jest
    jest.setTimeout(30000);

    const UPSERT_TEST_ENDPOINT = SLS_LOCALHOST + "/test/v1/visit";
    const TEST_ENDPOINT = SLS_LOCALHOST + "/test/v1/visit/{blogId}";

    beforeAll(async () => {
        await dynamodbReady();
        await serverlessReady();
    });

    test(`expect success for valid requests - no blog visits - simple flow`, async () => {
        await upsert({trackerId: uuidv4()});
        const blogId = uuidv4();
        await axios.get(TEST_ENDPOINT.replace("{blogId}", blogId), APPLICATION_JSON)
            .then(res => {
                expect(res.status).toEqual(200);
                console.info(JSON.stringify(res.data, null, 2));
                expect(res.data.blogId).toEqual(blogId);
                expect(res.data.total).toEqual(0);
            })
            .catch(error => {
                console.error(error);
                customFail('Get Blog Visits should not throw an error');
            });
    });

    test(`expect success for valid requests - blog visits - simple flow`, async () => {
        const blogId = uuidv4();

        await upsert({trackerId: uuidv4(), pages: [blogPage(blogId), blogPage(blogId), blogPage(blogId)]});
        await upsert({trackerId: uuidv4(), pages: [blogPage(blogId), blogPage(uuidv4()), blogPage(uuidv4())]});
        await upsert({trackerId: uuidv4(), pages: [blogPage(uuidv4()), blogPage(uuidv4()), blogPage(uuidv4())]});
        await upsert({trackerId: uuidv4(), pages: [blogPage(blogId)]});
        await upsert({trackerId: uuidv4(), pages: [blogPage(blogId)]});

        await axios.get(TEST_ENDPOINT.replace("{blogId}", blogId), APPLICATION_JSON)
            .then(res => {
                expect(res.status).toEqual(200);
                console.info(JSON.stringify(res.data, null, 2));
                expect(res.data.blogId).toEqual(blogId);
                expect(res.data.total).toEqual(4);
            })
            .catch(error => {
                console.error(error);
                customFail('Get Blog Visits should not throw an error');
            });
    });

    test(`expect bad-request for invalid request`, async () => {
        const blogId = crypto.randomBytes(100).toString("hex");
        await axios.get(TEST_ENDPOINT.replace("{blogId}", blogId), APPLICATION_JSON)
            .then(res => expect(res.status).not.toEqual(200))
            .catch(error => {
                const {message} = error.response.data;
                expect(error.response.status).toEqual(400);
                expect(message).toEqual("Bad Request");
            });
    });

    const upsert = async (request: any) => {
        await axios.post(UPSERT_TEST_ENDPOINT, request, APPLICATION_JSON)
            .then(res => expect(res.status).toEqual(200))
            .catch(error => {
                console.error(error);
                customFail('Upsert should not throw an error');
            });
    }

    const blogPage = (blogId: string): Page => {
        return {
            blogId,
            viewedTime: new Date().toISOString(),
            path: crypto.randomBytes(100).toString("hex")
        };
    }
});


