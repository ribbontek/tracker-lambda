export interface UpsertVisitCommand {
    readonly trackerId: string;
    readonly origin?: string | null;
    readonly referer?: string | null;
    readonly userAgent?: string | null;
    readonly ipAddress?: string | null;
    readonly pages?: Page[] | null;
}

export interface Page {
    readonly path: string;
    readonly viewedTime: string;
    readonly blogId?: string | null;
}

export interface GetVisitCommand {
    readonly blogId: string;
}

export type BlogVisits = {
    readonly blogId: string;
    readonly total: number;
}
