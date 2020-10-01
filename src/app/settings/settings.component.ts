import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  strUid: string;
  changedName: string;

  constructor(private router: Router, private auth: AngularFireAuth, private storage: AngularFireStorage, private conService: ConnectionService) { 
    this.conService.monitor().subscribe(isConnected => {
      if(!(isConnected)){
        window.alert('Please check your network connection and try again.');
      }
    })
  }

  changeDisplayName(){
    this.auth.currentUser.then(user => {
      user.updateProfile({
        displayName: this.changedName
      })
    })
    window.alert("Changed display name to: " + this.changedName);
  }

  goToBoard(){
    this.router.navigate(['board']);
  }

  onPhotoChange(event: any){
    const file = event.target.files[0];
      const filePath = "Users/" + this.strUid + "/Profile_Picture";
      const ref = this.storage.ref(filePath);      
      const task = ref.put(file).then(data => {             
        console.log(data);
        window.alert("Updated profile picture.");
        ref.getDownloadURL().subscribe(ur => {
          this.auth.currentUser.then(user => {
            user.updateProfile({
              photoURL: ur
            })
          })
          let img = document.getElementById("prof-pic");
          img.setAttribute("style", "border-radius: 50%; height: 100px; box-shadow: 5px 2px #888888");          
          img.setAttribute("src", ur);
        })
      }).catch(error => {
        console.log(error);
        window.alert("An error occured. Please try again.");        
      });      
  }

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      console.log(user);
      this.strUid = user.uid;
      let img = document.getElementById("prof-pic");
      img.setAttribute("src", user.photoURL);
      img.setAttribute("style", "border-radius: 50%; height: 100px; box-shadow: 5px 2px #888888");
      console.log(user.displayName);
    })
    
  }

}
