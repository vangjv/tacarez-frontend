export class MergeRequestRequest {
    featureName?: string;
    revisionName?: string;
    mergeRequesterNotes?: string;
    constructor(ftName:string,rvName:string, notes:string) {
        this.featureName = ftName;
        this.revisionName = rvName;
        this.mergeRequesterNotes = notes;
    }
}