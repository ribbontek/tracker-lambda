import {Page} from "@models/visit.model";

export interface VisitEntity {
    readonly trackerId: string;
    readonly origin?: string | null;
    readonly referer?: string | null;
    readonly userAgent?: string | null;
    readonly ipAddress?: string | null;
    readonly pages?: Page[] | null;
    readonly blogIds?: string[] | null;
    readonly created: string;
    readonly updated?: string | null;
}
