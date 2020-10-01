export class Reply{
    text: string;
    strUid: string;
    title: string;
    constructor(replyText: string, replierUid: any, questionTitle: string){
        this.text = replyText;
        this.strUid = replierUid;
        this.title = questionTitle;
    }
}