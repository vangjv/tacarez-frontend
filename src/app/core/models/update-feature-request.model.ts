export class UpdateFeatureRequest {
    message:string;
    content:string;
    committer:GitHubUser;
}

export class GitHubUser {
    name:string;
    email:string;
    date:string;
}