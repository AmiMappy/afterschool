import { Component, OnInit, ɵsetCurrentInjector } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute, RouterState, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthGuard } from '../auth.guard';
import { user } from '../login/login.component';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Question } from '../Question';
import { ConnectionService } from 'ng-connection-service';

export var ques: Question = new Question("Unset", "Unset", "Unset");

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})

export class BoardComponent implements OnInit {
  
  constructor(private auth: AngularFireAuth, private router: Router, private storage: AngularFireStorage, private afs: AngularFirestore, private conService: ConnectionService){

  }
  usr: firebase.User;
  em: string;
  submitBtn: HTMLElement;
  strUid: string;
  angFirSto: AngularFirestore;
  collection = this.afs.collection<any>("questions");
  allQuesLoaded: boolean;
  myQuesLoaded: boolean;
  imgUrl: Observable<string | null>;
  docIds: any[] = [];
  grades: any[] = ["All", 6, 7, 8, 9, 10, 11, 12];
  grade: any = "All";
  subject: string = "All";
  subjects: string[] = ["All", "Advice", "Physics", "Chemistry", "Biology", "Science", "Pol. Science", "History", "Geography", "Economics", "Social Science", "English", "Hindi", "French", "Sanskrit"];

  goToSettings(){
    this.router.navigate(['settings']);
  }

  signOut(){
    this.auth.signOut();
    this.router.navigate(['']);
    localStorage.clear();
    console.log("Signed Out successfully.");
  }

  askBtn(){
    window.alert("You are moving to the ask page. Post images of or type in text the question(s) you'd like to ask.");
    this.router.navigate(['ask']);
  }

  fillDocIds(){
    if(this.grade == "All" && this.subject == "All"){
      this.collection.snapshotChanges().forEach(data => {
        for(let item in data){
          let id = data[item].payload.doc.id;
          this.docIds.push(id);
          // console.log(data[item].payload.doc.id);
        }
      })
    } else if(this.grade == "All" && this.subject != "All"){
      this.afs.collection("questions", ref => ref.where("subject", "==", this.subject)).snapshotChanges().forEach(data => {
        for(let item in data){
          let id = data[item].payload.doc.id;
          this.docIds.push(id);
          // console.log(data[item].payload.doc.id);
        }
      })
    } else if(this.subject == "All" && this.grade != "All"){
      this.afs.collection("questions", ref => ref.where("grade", "==", this.grade)).snapshotChanges().forEach(data => {
        for(let item in data){
          let id = data[item].payload.doc.id;
          this.docIds.push(id);
          // console.log(data[item].payload.doc.id);
        }
      })
    } else {
      this.afs.collection("questions", ref => ref.where("grade", "==", this.grade).where("subject", "==", this.subject)).snapshotChanges().forEach(data => {
        for(let item in data){
          let id = data[item].payload.doc.id;
          this.docIds.push(id);
          // console.log(data[item].payload.doc.id);
        }
      })
    }
  }

  getMyQues(){
    if(this.myQuesLoaded == false) {
      this.collection.valueChanges().subscribe(data => {
        for(let item in data){
          let rter = this.router;
          let title = data[item]['title'];
          if(data[item]['uid'] == this.strUid){

            // Replies BEGINS
            let replies = document.createElement("DIV");
            let replyDocIds: any = [];

            this.collection.doc(this.docIds[item]).collection("replies").snapshotChanges().forEach(doc => {
              for(let item in doc){
                replyDocIds.push(doc[item].payload.doc.id);
                console.log(replyDocIds);
              }              
            })

            this.afs.collection("questions", ref => ref.where("grade", "==", this.grade)).doc(this.docIds[item]).collection<any>("replies").valueChanges().forEach(data => {
              for(let item in data){
                let replierUid: any;
                let replierDispName: any;
                let replyText: string;
                // console.log(data[item]);
                replierUid =  data[item]['replierUid'];
                replierDispName = data[item]['replierDispName'];
                replyText = data[item]['text'];
                // ultimately, we're going to have a mapping (sort of) of uids to usernames(i'll add usernames soon(maybe never)...).
                let reply = document.createElement("SPAN");               
  
                if(replierUid == this.strUid){
                  reply.innerText = "YOU" + "\t\treplied:-\t\t" + replyText + "\n";
                } else {
                  reply.innerText = replierDispName + "\t\treplies:-\t\t" + replyText + "\n";
                }
                reply.setAttribute("style", "color:green");
                replies.appendChild(reply);

                if(data[item]['filesLen'] != 0){
                  for(let i = 0; i < data[item]['filesLen']; i++){
                    let replyImg = document.createElement("IMG");
                    const replyRef = this.storage.ref(`Replies/${replyDocIds[item]}/${i.toString()}`);
                    replyRef.getDownloadURL().subscribe(url => {
                      replyImg.setAttribute("src", url);
                    })
                    replies.appendChild(replyImg);
                  }
                } else {
                  ;
                }

              }
            })
          // Replies ENDS 

          let replyBtn = document.createElement("BUTTON");
          replyBtn.setAttribute("id", data[item]['title']);
          replyBtn.onclick = function(){
            ques.title = data[item]['title'];
            ques.desc = data[item]['description'];
            ques.uid = data[item]['uid'];
            rter.navigate(["board/reply"]);
          }
          replyBtn.innerText = "Reply";
            let br = document.createElement("BR");
            let myQuesDiv = document.getElementById("myQues");
            let titleElem = document.createElement("PRE");
            titleElem.innerText = `${(Number(item) + 1).toString()} ${data[item]['title']}`;
            titleElem.setAttribute("style", "color:blue");
            let descElem = document.createElement("PRE");
            descElem.setAttribute("style", "color:grey");
            descElem.innerText = `\t${data[item]['description']}`;
            let imgElem = document.createElement("DIV");
            for(let i = 0; i < data[item]['filesLen']; i++){
              const ref = this.storage.ref("Questions/" + data[item]['uid'] + "/" + data[item]['title'] + i.toString());
              ref.getDownloadURL().subscribe(something => {
                let img = document.createElement("IMG");
                img.setAttribute("src", something);
                imgElem.appendChild(img);
              })
            }          
            myQuesDiv.appendChild(titleElem);
            myQuesDiv.appendChild(descElem);
            myQuesDiv.appendChild(imgElem);
            myQuesDiv.appendChild(br);
            myQuesDiv.appendChild(br);
            myQuesDiv.appendChild(replies);
            myQuesDiv.appendChild(br);
            myQuesDiv.appendChild(replyBtn);
            myQuesDiv.appendChild(br);
            myQuesDiv.appendChild(br); 
            myQuesDiv.appendChild(br);
          }
        }
      })
    }
    this.myQuesLoaded = true;
  }

  getAllQues(){
    if(this.allQuesLoaded == false){
      if(this.grade == "All" && this.subject != "All"){
        this.afs.collection("questions", ref => ref.where("subject", "==", this.subject)).valueChanges().forEach(data => {
          for(let item in data){
            let rter = this.router;
            let title = data[item]['title'];

            // Replies BEGINS
            let replies = document.createElement("DIV");
            let replyDocIds: any = [];

            this.collection.doc(this.docIds[item]).collection("replies").snapshotChanges().forEach(doc => {
              for(let item in doc){
                replyDocIds.push(doc[item].payload.doc.id);
                console.log(replyDocIds);
              }              
            })

            this.afs.collection("questions", ref => ref.where("grade", "==", this.grade)).doc(this.docIds[item]).collection<any>("replies").valueChanges().forEach(data => {
              for(let item in data){
                let replierUid: any;
                let replierDispName: any;
                let replyText: string;
                // console.log(data[item]);
                replierUid =  data[item]['replierUid'];
                replierDispName = data[item]['replierDispName'];
                replyText = data[item]['text'];
                // ultimately, we're going to have a mapping (sort of) of uids to usernames(i'll add usernames soon(maybe never)...).
                let reply = document.createElement("SPAN");               
  
                if(replierUid == this.strUid){
                  reply.innerText = "YOU" + "\t\treplied:-\t\t" + replyText + "\n";
                } else {
                  reply.innerText = replierDispName + "\t\treplies:-\t\t" + replyText + "\n";
                }
                reply.setAttribute("style", "color:green");
                replies.appendChild(reply);

                if(data[item]['filesLen'] != 0){
                  for(let i = 0; i < data[item]['filesLen']; i++){
                    let replyImg = document.createElement("IMG");
                    const replyRef = this.storage.ref(`Replies/${replyDocIds[item]}/${i.toString()}`);
                    replyRef.getDownloadURL().subscribe(url => {
                      replyImg.setAttribute("src", url);
                    })
                    replies.appendChild(replyImg);
                  }
                } else {
                  ;
                }

              }
            })               
            // Replies ENDS

            let replyBtn = document.createElement("BUTTON");
            replyBtn.setAttribute("id", data[item]['title']);
            replyBtn.onclick = function(){
              ques.title = data[item]['title'];
              ques.desc = data[item]['description'];
              ques.uid = data[item]['uid'];
              rter.navigate(["board/reply"]);
            }
            replyBtn.innerText = "Reply";
            let br = document.createElement("BR");
            let allQuesDiv = document.getElementById("allQues");
            let titleElem = document.createElement("PRE");
            if(data[item]['uid'] == this.strUid){
              titleElem.setAttribute("style", "color:blue");
              titleElem.innerText = `${(Number(item) + 1).toString()} ${data[item]['title']}: Asked by ME`;
            } else {
              titleElem.setAttribute("style", "color:black");
              titleElem.innerText = `${(Number(item) + 1).toString()} ${data[item]['title']}`;
            }
            let descElem = document.createElement("PRE");
            descElem.innerText = `\t${data[item]['description']}`;
            descElem.setAttribute("style", "color:grey");
            let imgElem = document.createElement("DIV");
            for(let i = 0; i < data[item]['filesLen']; i++){
              const ref = this.storage.ref("Questions/" + data[item]['uid'] + "/" + data[item]['title'] + i.toString());
              ref.getDownloadURL().subscribe(something => {
                let img = document.createElement("IMG");
                img.setAttribute("src", something);
                imgElem.appendChild(img);
              })
            }
            allQuesDiv.appendChild(titleElem);
            allQuesDiv.appendChild(descElem);
            allQuesDiv.appendChild(imgElem);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(replies);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(replyBtn);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(br); 
            allQuesDiv.appendChild(br);         
          }
        })        
      } else if(this.subject == "All" && this.grade != "All"){
        this.afs.collection("questions", ref => ref.where("grade", "==", this.grade)).valueChanges().forEach(data => {
          for(let item in data){
            let rter = this.router;
            let title = data[item]['title'];

            // Replies BEGINS 
            let replies = document.createElement("DIV");
            let replyDocIds: any = [];

            this.collection.doc(this.docIds[item]).collection("replies").snapshotChanges().forEach(doc => {
              for(let item in doc){
                replyDocIds.push(doc[item].payload.doc.id);
                console.log(replyDocIds);
              }              
            })

            this.afs.collection("questions", ref => ref.where("grade", "==", this.grade)).doc(this.docIds[item]).collection<any>("replies").valueChanges().forEach(data => {
              for(let item in data){
                let replierUid: any;
                let replierDispName: any;
                let replyText: string;
                // console.log(data[item]);
                replierUid =  data[item]['replierUid'];
                replierDispName = data[item]['replierDispName'];
                replyText = data[item]['text'];
                // ultimately, we're going to have a mapping (sort of) of uids to usernames(i'll add usernames soon(maybe never)...).
                let reply = document.createElement("SPAN");               
  
                if(replierUid == this.strUid){
                  reply.innerText = "YOU" + "\t\treplied:-\t\t" + replyText + "\n";
                } else {
                  reply.innerText = replierDispName + "\t\treplies:-\t\t" + replyText + "\n";
                }
                reply.setAttribute("style", "color:green");
                replies.appendChild(reply);

                if(data[item]['filesLen'] != 0){
                  for(let i = 0; i < data[item]['filesLen']; i++){
                    let replyImg = document.createElement("IMG");
                    const replyRef = this.storage.ref(`Replies/${replyDocIds[item]}/${i.toString()}`);
                    replyRef.getDownloadURL().subscribe(url => {
                      replyImg.setAttribute("src", url);
                    })
                    replies.appendChild(replyImg);
                  }
                } else {
                  ;
                }

              }
            })
            // Replies ENDS
                               
            let replyBtn = document.createElement("BUTTON");
            replyBtn.setAttribute("id", data[item]['title']);
            replyBtn.onclick = function(){
              ques.title = data[item]['title'];
              ques.desc = data[item]['description'];
              ques.uid = data[item]['uid'];
              rter.navigate(["board/reply"]);
            }
            replyBtn.innerText = "Reply";
            let br = document.createElement("BR");
            let allQuesDiv = document.getElementById("allQues");
            let titleElem = document.createElement("PRE");
            if(data[item]['uid'] == this.strUid){
              titleElem.setAttribute("style", "color:blue");
              titleElem.innerText = `${(Number(item) + 1).toString()} ${data[item]['title']}: Asked by ME`;
            } else {
              titleElem.setAttribute("style", "color:black");
              titleElem.innerText = `${(Number(item) + 1).toString()} ${data[item]['title']}`;
            }
            let descElem = document.createElement("PRE");
            descElem.innerText = `\t${data[item]['description']}`;
            descElem.setAttribute("style", "color:grey");
            let imgElem = document.createElement("DIV");
            for(let i = 0; i < data[item]['filesLen']; i++){
              const ref = this.storage.ref("Questions/" + data[item]['uid'] + "/" + data[item]['title'] + i.toString());
              ref.getDownloadURL().subscribe(something => {
                let img = document.createElement("IMG");
                img.setAttribute("src", something);
                imgElem.appendChild(img);
              })
            }
            allQuesDiv.appendChild(titleElem);
            allQuesDiv.appendChild(descElem);
            allQuesDiv.appendChild(imgElem);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(replies);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(replyBtn);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(br); 
            allQuesDiv.appendChild(br);         
          }
        })
      } else if(this.grade == "All" && this.subject == "All"){
        this.collection.valueChanges().forEach(data => {
          for(let item in data){
            let rter = this.router;
            let title = data[item]['title']; 
            
            //Replies BEGINS
            let replies = document.createElement("DIV");
            let replyDocIds: any = [];

            this.collection.doc(this.docIds[item]).collection("replies").snapshotChanges().forEach(doc => {
              for(let item in doc){
                replyDocIds.push(doc[item].payload.doc.id);
                console.log(replyDocIds);
              }              
            })

            this.afs.collection("questions", ref => ref.where("grade", "==", this.grade)).doc(this.docIds[item]).collection<any>("replies").valueChanges().forEach(data => {
              for(let item in data){
                let replierUid: any;
                let replierDispName: any;
                let replyText: string;
                // console.log(data[item]);
                replierUid =  data[item]['replierUid'];
                replierDispName = data[item]['replierDispName'];
                replyText = data[item]['text'];
                // ultimately, we're going to have a mapping (sort of) of uids to usernames(i'll add usernames soon(maybe never)...).
                let reply = document.createElement("SPAN");               
  
                if(replierUid == this.strUid){
                  reply.innerText = "YOU" + "\t\treplied:-\t\t" + replyText + "\n";
                } else {
                  reply.innerText = replierDispName + "\t\treplies:-\t\t" + replyText + "\n";
                }
                reply.setAttribute("style", "color:green");
                replies.appendChild(reply);

                if(data[item]['filesLen'] != 0){
                  for(let i = 0; i < data[item]['filesLen']; i++){
                    let replyImg = document.createElement("IMG");
                    const replyRef = this.storage.ref(`Replies/${replyDocIds[item]}/${i.toString()}`);
                    replyRef.getDownloadURL().subscribe(url => {
                      replyImg.setAttribute("src", url);
                    })
                    replies.appendChild(replyImg);
                  }
                } else {
                  ;
                }

              }
            })
            //Replies ENDS

            let replyBtn = document.createElement("BUTTON");
            replyBtn.setAttribute("id", data[item]['title']);
            replyBtn.onclick = function(){
              ques.title = data[item]['title'];
              ques.desc = data[item]['description'];
              ques.uid = data[item]['uid'];
              rter.navigate(["board/reply"]);
            }
            replyBtn.innerText = "Reply";
            let br = document.createElement("BR");
            let allQuesDiv = document.getElementById("allQues");
            let titleElem = document.createElement("PRE");
            if(data[item]['uid'] == this.strUid){
              titleElem.setAttribute("style", "color:blue");
              titleElem.innerText = `${(Number(item) + 1).toString()} ${data[item]['title']}: Asked by ME`;
            } else {
              titleElem.setAttribute("style", "color:black");
              titleElem.innerText = `${(Number(item) + 1).toString()} ${data[item]['title']}`;
            }
            let descElem = document.createElement("PRE");
            descElem.innerText = `\t${data[item]['description']}`;
            descElem.setAttribute("style", "color:grey");
            let imgElem = document.createElement("DIV");
            for(let i = 0; i < data[item]['filesLen']; i++){
              const ref = this.storage.ref("Questions/" + data[item]['uid'] + "/" + data[item]['title'] + i.toString());
              ref.getDownloadURL().subscribe(something => {
                let img = document.createElement("IMG");
                img.setAttribute("src", something);
                imgElem.appendChild(img);
              })
            } 
            allQuesDiv.appendChild(titleElem);
            allQuesDiv.appendChild(descElem);
            allQuesDiv.appendChild(imgElem);
            allQuesDiv.appendChild(replyBtn);
            allQuesDiv.appendChild(replies);
          }
        })
      } else {
        this.afs.collection("questions", ref => ref.where("subject", "==", this.subject).where("grade", "==", this.grade)).valueChanges().forEach(data => {
          for(let item in data){
            let rter = this.router;
            let title = data[item]['title'];

            //Replies BEGINS
            let replies = document.createElement("DIV");
            let replyDocIds: any = [];

            this.collection.doc(this.docIds[item]).collection("replies").snapshotChanges().forEach(doc => {
              for(let item in doc){
                replyDocIds.push(doc[item].payload.doc.id);
                console.log(replyDocIds);
              }              
            })

            this.afs.collection("questions", ref => ref.where("grade", "==", this.grade)).doc(this.docIds[item]).collection<any>("replies").valueChanges().forEach(data => {
              for(let item in data){
                let replierUid: any;
                let replierDispName: any;
                let replyText: string;
                // console.log(data[item]);
                replierUid =  data[item]['replierUid'];
                replierDispName = data[item]['replierDispName'];
                replyText = data[item]['text'];
                // ultimately, we're going to have a mapping (sort of) of uids to usernames(i'll add usernames soon(maybe never)...).
                let reply = document.createElement("SPAN");               
  
                if(replierUid == this.strUid){
                  reply.innerText = "YOU" + "\t\treplied:-\t\t" + replyText + "\n";
                } else {
                  reply.innerText = replierDispName + "\t\treplies:-\t\t" + replyText + "\n";
                }
                reply.setAttribute("style", "color:green");
                replies.appendChild(reply);

                if(data[item]['filesLen'] != 0){
                  for(let i = 0; i < data[item]['filesLen']; i++){
                    let replyImg = document.createElement("IMG");
                    const replyRef = this.storage.ref(`Replies/${replyDocIds[item]}/${i.toString()}`);
                    replyRef.getDownloadURL().subscribe(url => {
                      replyImg.setAttribute("src", url);
                    })
                    replies.appendChild(replyImg);
                  }
                } else {
                  ;
                }

              }
            })
            // Replies ENDS
            
            let replyBtn = document.createElement("BUTTON");
            replyBtn.setAttribute("id", data[item]['title']);
            replyBtn.onclick = function(){
              ques.title = data[item]['title'];
              ques.desc = data[item]['description'];
              ques.uid = data[item]['uid'];
              rter.navigate(["board/reply"]);
            }
            replyBtn.innerText = "Reply";
            let br = document.createElement("BR");
            let allQuesDiv = document.getElementById("allQues");
            let titleElem = document.createElement("PRE");
            if(data[item]['uid'] == this.strUid){
              titleElem.setAttribute("style", "color:blue");
              titleElem.innerText = `${(Number(item) + 1).toString()} ${data[item]['title']}: Asked by ME`;
            } else {
              titleElem.setAttribute("style", "color:black");
              titleElem.innerText = `${(Number(item) + 1).toString()} ${data[item]['title']}`;
            }
            let descElem = document.createElement("PRE");
            descElem.innerText = `\t${data[item]['description']}`;
            descElem.setAttribute("style", "color:grey");
            let imgElem = document.createElement("DIV");
            
            allQuesDiv.appendChild(titleElem);
            allQuesDiv.appendChild(descElem);
            allQuesDiv.appendChild(imgElem);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(replies);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(replyBtn);
            allQuesDiv.appendChild(br);
            allQuesDiv.appendChild(br); 
            allQuesDiv.appendChild(br);         
          }
        })
      }           
    }
    this.allQuesLoaded = true;
  }

  ngOnInit(): void {
    this.auth.onAuthStateChanged(us => {
      this.usr = us;
      console.log(this.usr.email);
      this.strUid = us.uid;
      console.log(this.strUid);
      console.log(us.photoURL);
      console.log(us.displayName);
    });
    this.conService.monitor().subscribe(isConnected => {
      if(!(isConnected)){
        window.alert('Please check your network connection and try again.');
      }
    })
    this.submitBtn = document.getElementById("submitBtn");
    this.allQuesLoaded = false;
    this.myQuesLoaded = false;
    this.fillDocIds();
    // this.getAllQues();
    // this.getMyQues();
  }
}
