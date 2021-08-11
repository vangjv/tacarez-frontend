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
    stakeholderReview: StakeholderReview;
    createdDate?: Date;
    lastModifiedDate?: Date;
}

export class StakeholderReview {
    envelopeId?: string;
    status?: string;
    createdDate?: Date;
    stakeholders?: User[];
}



