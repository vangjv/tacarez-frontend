import { User } from "./user.model";

export class NewRevisionRequest {
    featureName: string;
    revisionName: string;
    description: string;
    Owner: User;
}

