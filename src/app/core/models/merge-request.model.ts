import { User } from "./user.model";

export class MergeRequest {
    id: string;
    type: string;
    featureName: string;
    revisionName: string;
    gitHubRawURL: string;
    owner: User;
    status: string;
    mergeRequester: User;
    mergeRequesterNotes?: string;
    contributors?: User[];
    public stakeholderReview: StakeholderReview;
    createdDate?: Date;
    lastModifiedDate?: Date;
}

export class StakeholderReview {
    public envelopeId?: string;
    public envelopeStatus?: RecipientStatus[];
    public status?: string;
    public createdDate?: Date;
    public stakeholders?: User[];
}

export class RecipientStatus {
    public recipientName?: string;
    public email?: string;
    public initialSentDateTime?: string;
    public deliveredDateTime?: string;
    public signedDateTime?: string;
}

