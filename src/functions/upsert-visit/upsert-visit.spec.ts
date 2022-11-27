import axios from "axios";
import {v4 as uuidv4} from "uuid";
import {VisitRepository} from "@repos/visit-repository";
import * as crypto from "crypto";
import {APPLICATION_JSON, customFail, dynamodbReady, serverlessReady, SLS_LOCALHOST} from "@test-utils/shared";
import {Page} from "@models/visit.model";

describe("Upsert Visit Integration Test", () => {
    // set global timeout for jest
    jest.setTimeout(30000);

    const TEST_ENDPOINT = SLS_LOCALHOST + "/test/v1/visit";

    beforeAll(async () => {
        await dynamodbReady();
        await serverlessReady();
    });

    test(`expect success for valid requests - simple flow`, async () => {
        const validRequest = {
            trackerId: uuidv4(),
        };

        await axios.post(TEST_ENDPOINT, validRequest, APPLICATION_JSON)
            .then(res => expect(res.status).toEqual(200))
            .catch(error => {
                console.error(error);
                customFail('It should not throw an error');
            });

        const visitEntity = await new VisitRepository().getVisitsByTrackerId(validRequest.trackerId);
        expect(visitEntity).not.toBeNull();
        expect(visitEntity.trackerId).toEqual(validRequest.trackerId);
        expect(visitEntity.created).not.toBeNull();
        expect(visitEntity.updated).toBeNull();
        expect(visitEntity.origin).toBeNull();
        expect(visitEntity.referer).toBeNull();
        expect(visitEntity.userAgent).toEqual('axios/0.27.2');
        expect(visitEntity.ipAddress).toEqual('127.0.0.1');
        expect(visitEntity.pages).toBeNull();
        expect(visitEntity.blogIds).toBeNull();
    });

    test(`expect success for valid requests - complex flow`, async () => {
        const validCreateRequest = {
            trackerId: uuidv4(),
            pages: [
                randomPage()
            ]
        };

        const headers = {
            headers: {
                contentType: "application/json",
                origin: 'http://localhost:3000',
                referer: 'http://localhost:3000/home',
                'User-Agent': 'Chrome',
            }
        }

        await axios.post(TEST_ENDPOINT, validCreateRequest, headers)
            .then(res => expect(res.status).toEqual(200))
            .catch(error => {
                console.error(error);
                customFail('Upsert should not throw an error');
            });

        const visitEntity = await new VisitRepository().getVisitsByTrackerId(validCreateRequest.trackerId);
        expect(visitEntity).not.toBeNull();
        expect(visitEntity.trackerId).toEqual(validCreateRequest.trackerId);
        expect(visitEntity.created).not.toBeNull();
        expect(visitEntity.updated).toBeNull();
        expect(visitEntity.origin).toEqual(headers.headers.origin);
        expect(visitEntity.referer).toEqual(headers.headers.referer);
        expect(visitEntity.userAgent).toEqual(headers.headers["User-Agent"]);
        expect(visitEntity.ipAddress).toEqual('127.0.0.1');
        expect(visitEntity.pages.length).toEqual(validCreateRequest.pages.length);
        validCreateRequest.pages.forEach(page => {
                const entityPage = visitEntity.pages.find(p => p.path == page.path);
                expect(page.path).toEqual(entityPage.path);
                expect(page.viewedTime).toEqual(entityPage.viewedTime);
                expect(page.blogId).toEqual(entityPage.blogId);
            }
        );
        expect(visitEntity.blogIds).toEqual(validCreateRequest.pages.map(p => p.blogId));

        const validUpdateRequest = {
            trackerId: validCreateRequest.trackerId,
            pages: [
                randomPage(),
                randomPage(),
                randomPage(),
            ]
        };

        await axios.post(TEST_ENDPOINT, validUpdateRequest, headers)
            .then(res => expect(res.status).toEqual(200))
            .catch(error => {
                console.error(error);
                customFail('Upsert should not throw an error');
            });

        const visitEntityUpdated = await new VisitRepository().getVisitsByTrackerId(validCreateRequest.trackerId);
        expect(visitEntityUpdated).not.toBeNull();
        expect(visitEntityUpdated.trackerId).toEqual(validCreateRequest.trackerId);
        expect(visitEntityUpdated.created).not.toBeNull();
        expect(visitEntityUpdated.updated).not.toBeNull();
        expect(visitEntityUpdated.origin).toEqual(headers.headers.origin);
        expect(visitEntityUpdated.referer).toEqual(headers.headers.referer);
        expect(visitEntityUpdated.userAgent).toEqual(headers.headers["User-Agent"]);
        expect(visitEntityUpdated.ipAddress).toEqual('127.0.0.1');
        const expectedPages = validCreateRequest.pages.concat(validUpdateRequest.pages);
        expect(visitEntityUpdated.pages.length).toEqual(expectedPages.length);
        expectedPages.forEach(page => {
                const entityPage = visitEntityUpdated.pages.find(p => p.path == page.path);
                expect(page.path).toEqual(entityPage.path);
                expect(page.viewedTime).toEqual(entityPage.viewedTime);
                expect(page.blogId).toEqual(entityPage.blogId);
            }
        );
        expect(visitEntity.blogIds).toEqual(validCreateRequest.pages.map(p => p.blogId));

        const validUpdateRequest2 = {
            trackerId: validCreateRequest.trackerId
        };

        await axios.post(TEST_ENDPOINT, validUpdateRequest2, headers)
            .then(res => expect(res.status).toEqual(200))
            .catch(error => {
                console.error(error);
                customFail('Upsert should not throw an error');
            });

        const visitEntityUpdated2 = await new VisitRepository().getVisitsByTrackerId(validCreateRequest.trackerId);
        expect(visitEntityUpdated2).not.toBeNull();
        expect(visitEntityUpdated2.trackerId).toEqual(validCreateRequest.trackerId);
        expect(visitEntityUpdated2.created).not.toBeNull();
        expect(visitEntityUpdated2.updated).not.toBeNull();
        expect(visitEntityUpdated2.origin).toEqual(headers.headers.origin);
        expect(visitEntityUpdated2.referer).toEqual(headers.headers.referer);
        expect(visitEntityUpdated2.userAgent).toEqual(headers.headers["User-Agent"]);
        expect(visitEntityUpdated2.ipAddress).toEqual('127.0.0.1');
        expect(visitEntityUpdated.pages.length).toEqual(expectedPages.length);
        expectedPages.forEach(page => {
                const entityPage = visitEntityUpdated.pages.find(p => p.path == page.path);
                expect(page.path).toEqual(entityPage.path);
                expect(page.viewedTime).toEqual(entityPage.viewedTime);
                expect(page.blogId).toEqual(entityPage.blogId);
            }
        );
        expect(visitEntity.blogIds).toEqual(validCreateRequest.pages.map(p => p.blogId));
    });

    test(`expect bad-request for invalid request`, async () => {
        const validRequest = {
            trackerId: crypto.randomBytes(100).toString("hex"),
        };

        await axios.post(TEST_ENDPOINT, validRequest, APPLICATION_JSON)
            .then(res => expect(res.status).not.toEqual(200))
            .catch(error => {
                const {message} = error.response.data;
                expect(error.response.status).toEqual(400);
                expect(message).toEqual("Bad Request");
            });
    });

    const randomPage = (): Page => {
        return {
            blogId: uuidv4(),
            viewedTime: new Date().toISOString(),
            path: crypto.randomBytes(100).toString("hex")
        };
    }
});


