export class MergeAction {
    mergeId?: string;
    action?: string;
    constructor(id:string, mergeAction:string) {
        this.mergeId = id;
        this.action = mergeAction;
    }
}