import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Router } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  email: string;
  password: string;
  rtypepassword: string;
  constructor(private auth: AngularFireAuth, private router: Router, private conService: ConnectionService) {
    this.conService.monitor().subscribe(isConnected => {
      if(!(isConnected)){
        window.alert('Please check your network connection and try again.');
      }
    })
  }

  emailSignUp(em, ps, rtp){
    if(ps === rtp){
      this.auth.createUserWithEmailAndPassword(em, ps).then(data => {
        console.log(data);
        console.log(`Created user successfully.`);
        this.auth.signInWithEmailAndPassword(em, ps).then(data => {
          console.log(data);
          window.alert(`Welcome!`);
          this.router.navigate(['settings']);
        }).catch(error => {
          console.log(error);
          window.alert("Oops! An error occured. Please try again!");
        })     
      }).catch(error => {
        console.log(error);
        if(error == "Error: The email address is already in use by another account."){
          this.auth.signInWithEmailAndPassword(em, ps).then(data => {
            console.log(`${data}`);
            window.alert("You already have an account. Redirecting to dashboard...");
            this.router.navigate(['/board']);
          }).catch(error => {
            console.log(`${error}`);
            window.alert("This email is already in use.");
            this.email = "";
            this.password = "";
          })
        } else {
          window.alert("Please try again.");
          this.email = "";
          this.password = "";
        }
      })
    } else {
      this.rtypepassword = "";
      this.password = "";
      console.log("Passwords didn't match.");
      window.alert("Re-typed password didn't match. Try again.");
    }
    
  }

  ngOnInit(): void {
  }

}
