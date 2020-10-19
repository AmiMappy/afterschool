import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Reply } from '../Reply';
import { ConnectionService } from 'ng-connection-service';

export var quesRef;

@Component({
  selector: 'app-ask',
  templateUrl: './ask.component.html',
  styleUrls: ['./ask.component.css']
})
export class AskComponent implements OnInit {

  constructor(private storage: AngularFireStorage, private auth: AngularFireAuth, private router: Router, private afs: AngularFirestore, private conService: ConnectionService) {
    this.conService.monitor().subscribe(isConnected => {
      if(!(isConnected)){
        window.alert('Please check your network connection and try again.');
      }
    })
  }

  usr: firebase.User;
  strUid: string;
  quesTitle: string;
  quesDesc: string;
  quesTags: string[];
  filePickEvent: any;
  tags: object;
  questionsRef = this.afs.collection<any>("questions");
  // quesDocRef = this.afs.doc("questions/" + this.strUid);
  dt = new Date();
  noOfFiles: any;
  grade: any = "Any";
  grades: any[] = ["Any", 6, 7, 8, 9, 10, 11, 12];
  subject: string = "Any";
  subjects: string[] = ["Any", "Advice", "Physics", "Chemistry", "Biology", "Science", "Pol. Science", "History", "Geography", "Economics", "Social Science", "English", "Hindi", "French", "Sanskrit"];

  onChange(event){
    this.filePickEvent = event;
  }

  uploadQuesImg(event) {
    
    // Image submission to Cloud Storage
    for(let i = 0; i < event.target.files.length; i++){
      /*
      let imgElem = document.getElementById("image-viewer").appendChild(document.createElement("IMG"));
      imgElem.setAttribute("src", "#");
      imgElem.setAttribute("id", "uploadPreview");
      imgElem.setAttribute("width", "700");
      imgElem.setAttribute("height", "140");
      var oFReader = new FileReader();
      oFReader.readAsDataURL(event.target.files[i]);
      oFReader.onload = function (oFREvent) {
        document.getElementById("uploadPreview").setAttribute("src", oFREvent.target.result.toString());
      };
      */
      this.noOfFiles = event.target.files.length;
      const file = event.target.files[i];
      const filePath = 'Questions/' + this.strUid + "/" + this.quesTitle + i.toString();
      const ref = this.storage.ref(filePath);
      if(this.quesTitle != ""){
        const task = ref.put(file).then(data => {
          let filenameelem = document.createElement("P");
          filenameelem.innerText = `${file.name}`
          document.getElementById("show-files").appendChild(filenameelem);
          console.log(`${data}`);
          window.alert(`Uploaded ${file.name}.`);
          ref.getDownloadURL().subscribe(ur => {
            let img = document.createElement("IMG");
            /*var delBtn = document.createElement("BUTTON");
            delBtn.innerText = "Un-upload " + file.name;
            delBtn.setAttribute("ng-click", `${ref.child(file.name).delete()}`);*/
            img.setAttribute("src", ur);
            document.getElementById("show-files").appendChild(img);
            /*document.getElementById("show-files").appendChild(delBtn);*/
          })
          i += 1;
        }).catch(error => {
          console.log(error);
          window.alert("An error occured. Please try again.");
          i += 1;
        });
      } else {
        window.alert("Please add a title.");
      }
    }          
  }

  submitQuesText(t: string, d: string){    
    if((t != null) || (t != "")){
      /*
      let docId = this.questionsRef.get().subscribe(data => {
        console.log(data['id']);
      })
      */
      if((this.grade >= 6 && this.grade <= 12) || this.grade == "Any"){
        this.questionsRef.add({title: t, description: d, grade: this.grade, subject: this.subject, uid: this.strUid, date: this.dt.getDate(), filesLen: this.noOfFiles});
        quesRef = this.questionsRef;
      }
    }            
  }

  signOut(){
  
    this.auth.signOut();
    this.router.navigate(['']);
    localStorage.clear();
    console.log("Signed Out successfully.");
    
  }

  getQuesBtn(){
    this.router.navigate(['/board']);
  }

  ngOnInit(): void {
    this.auth.onAuthStateChanged(us => {
      this.usr = us;
      this.strUid = this.usr.uid.toString();
      console.log(this.usr.email);
    }) 
  }

}
