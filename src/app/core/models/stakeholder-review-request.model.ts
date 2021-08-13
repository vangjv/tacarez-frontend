import { User } from "./user.model";

export class StakeholderReviewRequest {
    mergeId: string;
    senderName: string;
    messageFromSender: string;
    stakeholders: User[];
}
