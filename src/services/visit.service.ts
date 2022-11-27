import {VisitRepository} from "@repos/visit-repository";
import {handleApiError} from "@libs/utils";
import {
    mapQueryResultToBlogVisits,
    mapUpsertVisitCommandToCreateEntity,
    mapUpsertVisitCommandToUpdateEntity
} from "@mappers/visit.mapper";
import {BlogVisits, GetVisitCommand, UpsertVisitCommand} from "@models/visit.model";

export class VisitService {

    constructor(
        private readonly visitRepository = new VisitRepository()
    ) {
    }

    public visit = async (cmd: UpsertVisitCommand): Promise<void> => {
        return this.visitRepository.getVisitsByTrackerId(cmd.trackerId)
            .then(data => {
                if (!!data) {
                    return this.visitRepository.updateVisit(mapUpsertVisitCommandToUpdateEntity(data, cmd))
                } else {
                    return this.visitRepository.createVisit(mapUpsertVisitCommandToCreateEntity(cmd));
                }
            }).catch(error => handleApiError(error))
    };

    public getVisitsByBlogId = async (cmd: GetVisitCommand): Promise<BlogVisits> => {
        return this.visitRepository.getVisitsByBlogId(cmd.blogId)
            .then(data => {
                if (!!data) {
                    return mapQueryResultToBlogVisits(cmd.blogId, data)
                } else {
                    return mapQueryResultToBlogVisits(cmd.blogId, 0);
                }
            }).catch(error => handleApiError(error))
    };
}
