import { User } from "./user.model";

export class Revision {
    id: string;
    featureName?: string;
    revisionName?: string;
    gitHubRawURL?: string;
    type?: string;
    description?: string;
    createdDate?:Date;
    lastModifiedDate?:Date;
    owner?: User;
    contributors?: any;
}