export class Question{
    title: string;
    uid: string;
    desc: string;
    constructor(public t: string, public d: string, public userId: string){
        this.uid = userId;
        this.title = t;
        this.desc = d;
    }
}