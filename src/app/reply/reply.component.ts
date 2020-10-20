import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ques } from '../board/board.component';
import { Question } from '../Question';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Reply } from '../Reply';
import { Location } from '@angular/common';
import { AngularFireStorage } from '@angular/fire/storage';
import { ConnectionService } from 'ng-connection-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.css']
})
export class ReplyComponent implements OnInit {
  title = ques.title;
  desc = ques.desc;
  questionUid = ques.uid;
  reply: Reply;
  replyText: string = " ";
  replierUid: string = " ";  
  filePickEvent: any;
  filesLength: any = 0;
  questionId: any;
  replyId: any;
  replierDispName: any = "";

  constructor(private afs: AngularFirestore, private router: Router, private auth: AngularFireAuth, private _location: Location, private storage: AngularFireStorage, private conService: ConnectionService) {
    
  }

  onChange(event){
    this.filePickEvent = event;
    this.filesLength = this.filePickEvent.target.files.length;
  }

  goBack(){
    this._location.back();
  }

  submitReply(){
    let flen = 0;
    let rid: any;
    this.afs.collection("questions", ref => ref.where("title", "==", this.title)).snapshotChanges().forEach(doc => {
      // console.log(doc[0].payload.doc.id);
      this.questionId = doc[0].payload.doc.id;
      this.afs.collection("questions").doc(this.questionId).collection("replies").add({replierUid: this.replierUid, replierDispName: this.replierDispName, text: this.replyText, quesId: this.questionId, quesTitle: this.title, quesUid: this.questionUid, filesLen: this.filesLength}).then(() => {
        this.afs.collection("questions").doc(this.questionId).collection("replies", ref => ref.where("replier", "==", this.replierUid).where("text", "==", this.replyText).where("quesId", "==", this.questionId).where("quesTitle", "==", this.title).where("quesUid", "==", this.questionUid)).snapshotChanges().forEach(doc => {
          this.replyId = doc[0].payload.doc.id;
          flen = this.filesLength;
          rid = doc[0].payload.doc.id;
          if(flen != 0){
            for(let i = 0; i < flen; i++){
              const file = this.filePickEvent.target.files[i];
              const filePath = "Replies/" + rid + "/" + i.toString();
              const ref = this.storage.ref(filePath);      
              const task = ref.put(file).then(data => {
                let filenameelem = document.createElement("P");
                filenameelem.innerText = `${file.name}`
                document.getElementById("show-files").appendChild(filenameelem);
                console.log(`${data}`);
                window.alert(`Uploaded ${file.name}.`);
                ref.getDownloadURL().subscribe(ur => {
                  let img = document.createElement("IMG");         
                  img.setAttribute("src", ur);
                  document.getElementById("show-files").appendChild(img);          
                })
                i += 1;
              }).catch(error => {
                console.log(error);
                window.alert("An error occured. Please try again.");
                i += 1;
              });      
            }
          } else {
            ;
          }
        })
      });
    })   
  }
  // The below belongs to the submitReply() method.
  /*
  this.afs.collection("questions").doc(this.firestoreDocId).collection("replies").add({replier: this.replierUid, replyText: this.replyText, title: this.title}).then(data => {
    console.log(data);
  }).then(() => {
    this.afs.collection("questions").doc(this.firestoreDocId).collection("replies", ref => ref.where("replier", "==", this.replierUid)).snapshotChanges().forEach(data => {
      console.log(data);
    })
  })
  */
  /*      
  setTimeout(() => {
    this.uploadImgs();
  }, 5000);    
  */

  ngOnInit(): void {
    if(this.title == "Unset"){
      window.alert("Page reloaded. Exiting...");
      this.router.navigate(["board"]);
    } else {
      document.getElementById("title").innerText = this.title;
      document.getElementById("description").innerText = this.desc;
      this.auth.onAuthStateChanged(user => {
        this.replierUid = user.uid;
        if(user.displayName == undefined){
          this.replierDispName = this.replierUid;
        } else {
          this.replierDispName = user.displayName;
        }
        console.log(typeof(this.replierUid));
        console.log(this.replierUid);
      })
    }
    /*
    let docId;
    this.afs.collection("questions", ref => ref.where("title", "==", this.title)).snapshotChanges().forEach(doc => {
      for(let item in doc){
        console.log(doc[item].payload.doc.id);
        docId = doc[item].payload.doc.id;
        this.afs.collection("questions", ref => ref.where("title", "==", this.title)).doc(docId).collection("replies").valueChanges().forEach(data => {
          console.log(data);
        })
      }
    })
    */
  }

}
