import { User } from "./user.model";

export class MergeRequest {
    id: string;
    type: string;
    featureName: string;
    revisionName: string;
    gitHubRawURL: string;
    owner: User;
    mergeRequester: User;
    mergeRequesterNotes?: string;
    contributors?: User[];
    public stakeholderReview: StakeholderReview;
    createdDate?: Date;
    lastModifiedDate?: Date;
}

export class StakeholderReview {
    public envelopeId?: string;
    public status?: string;
    public createdDate?: Date;
    public stakeholders?: User[];
}



