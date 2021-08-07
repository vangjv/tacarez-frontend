import { User } from "./user.model";

export class NewFeature {
    Id: string;
    Description: string;
    Owner: User;
    Tags: string[];
}

export class NewFeatureRequest {
    feature: NewFeature;
    message: string;
    content: string;
}

