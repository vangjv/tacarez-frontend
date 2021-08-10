import { User } from "./user.model";

export class Feature {
    id: string;
    gitHubName?: string;
    gitHubRawURL?: string;
    type?: string;
    description?: string;
    createdDate?:Date;
    lastModifiedDate?:Date;
    owner?: User;
    contributors?: User[];
    stakeholders?: User[];
    branches?: any;
    tags?: string[];
}