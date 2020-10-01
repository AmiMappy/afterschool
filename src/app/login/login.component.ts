import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Router, ResolveEnd } from '@angular/router';
import { ConnectionService } from 'ng-connection-service' ;

export let user: firebase.User;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  rtypepass: string;
  semail: string;
  spassword: string;
  loggedIn: boolean;

  constructor(private auth: AngularFireAuth, private router: Router, private conService: ConnectionService) { }

  googleLogin(){    
    return new Promise((resolve, reject) => {
      this.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(data => {
        console.log(`Logged in successfully.`);
        user = data.user;
        this.loggedIn = true;
        resolve(this.loggedIn);
      }).catch(error => {
        console.log(error);
        reject(error);
        if(error == "Error: The popup has been closed by the user before finalizing the operation."){
          window.alert("You are not logged in. You just closed the Google login pop-up.")
        } else {
          window.alert(error);
        }      
      })
    })
  }

  goLogin(){
    this.googleLogin().then(data => {
      console.log(data);
    })
  }

  emLogin(){
    this.emailLogin().then(data => {
      if(data){
        this.router.navigate(['board']);
      }
    })
  }

  emailLogin(){    
    return new Promise((resolve, reject) => {
      this.auth.signInWithEmailAndPassword(this.email, this.password).then(data => {
        console.log(data);
        user = data.user;
        this.loggedIn = true;
        resolve(this.loggedIn);
      }).catch(error => {
        console.log(error);
        reject(error);
        if(error == "Error: The email address is badly formatted."){
          window.alert("Please type a valid email address.");
        } if(error == "Error: There is no user record corresponding to this identifier. The user may have been deleted."){
          window.alert("Might want to consider signing-up first!");
          this.router.navigate(['signup']);
        }
        else {
          window.alert(error);
        }
      })
    })
  }

  ngOnInit(): void {
    this.loggedIn = false;
    this.conService.monitor().subscribe(isConnected => {
      if(!(isConnected)){
        window.alert('Please check your network connection and try again.');
      }
    })
    if(this.auth.currentUser){
      this.router.navigate(['board']);
    }
  }

}
