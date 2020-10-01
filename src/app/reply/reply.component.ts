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
  firestoreDocId: any = " ";
  filePickEvent: any;
  urls: string[] = [];

  replyId: any;

  constructor(private afs: AngularFirestore, private router: Router, private auth: AngularFireAuth, private _location: Location, private storage: AngularFireStorage, private conService: ConnectionService) {
    
  }

  onChange(event){
    this.filePickEvent = event;
  } 

  submitReply(){
    this.afs.collection<any>("questions", ref => ref.where("title", "==", this.title)).snapshotChanges().subscribe(data => {
      this.firestoreDocId = data[0].payload.doc.id;
      //console.log(this.firestoreDocId);
      this.afs.collection<any>("questions").doc(this.firestoreDocId).collection<any>("replies").add({title: this.title, replierUid: this.replierUid, replyText: this.replyText, urls: this.urls}).then(result => {
        // console.log(result.id);
        this.replyId = result.id;
      })      
    })
  }

  ngOnInit(): void {
    if(this.title == "Unset"){
      window.alert("Page reloaded. Exiting...");
      this.router.navigate(["board"]);
    } else {
      document.getElementById("title").innerText = this.title;
      document.getElementById("description").innerText = this.desc;
      this.auth.onAuthStateChanged(user => {
        this.replierUid = user.uid;
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
