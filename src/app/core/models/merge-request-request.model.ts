export class MergeRequestRequest {
    featureName?: string;
    revisionName?: string;
    constructor(ftName:string,rvName:string) {
        this.featureName = ftName;
        this.revisionName =rvName ;
    }
}