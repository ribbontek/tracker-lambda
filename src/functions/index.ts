import upsertVisit from "@functions/upsert-visit";
import getBlogVisits from "@functions/get-blog-visits";
import health from "@functions/health";

/* tslint:disable */
export const functions = {
    "upsert-visit": upsertVisit,
    "get-blog-visits": getBlogVisits,
    "health": health
}
/* tslint:enable */
