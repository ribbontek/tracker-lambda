import {VisitEntity} from "@repos/visit-entity";
import {undefinedToNull} from "@libs/utils";
import {BlogVisits, UpsertVisitCommand} from "@models/visit.model";

export const mapUpsertVisitCommandToCreateEntity = (cmd: UpsertVisitCommand): VisitEntity => {
    return {
        trackerId: cmd.trackerId,
        origin: undefinedToNull(cmd.origin),
        referer: undefinedToNull(cmd.referer),
        userAgent: undefinedToNull(cmd.userAgent),
        pages: undefinedToNull(cmd.pages),
        ipAddress: undefinedToNull(cmd.ipAddress),
        blogIds: !!cmd.pages ? [...new Set(cmd.pages.map(p => p.blogId))] : null,
        created: new Date().toISOString(),
        updated: null
    };
};

export const mapUpsertVisitCommandToUpdateEntity = (data: VisitEntity, cmd: UpsertVisitCommand): VisitEntity => {
    if (!!data.pages && !!cmd.pages) data.pages.push(...cmd.pages)
    return {
        trackerId: data.trackerId,
        origin: undefinedToNull(cmd.origin),
        referer: undefinedToNull(cmd.referer),
        userAgent: undefinedToNull(cmd.userAgent),
        ipAddress: undefinedToNull(cmd.ipAddress),
        pages: !!data.pages ? data.pages : undefinedToNull(cmd.pages),
        blogIds: !!data.pages ? [...new Set(data.pages.map(p => p.blogId))] : (!!cmd.pages ? [...new Set(cmd.pages.map(p => p.blogId))] : null),
        created: data.created,
        updated: new Date().toISOString()
    };
};

export const mapQueryResultToBlogVisits = (blogId: string, count: number): BlogVisits => {
    return {
        blogId: blogId,
        total: count
    };
};
