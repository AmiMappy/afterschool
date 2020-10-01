import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Router } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-loginwgoogle',
  templateUrl: './loginwgoogle.component.html',
  styleUrls: ['./loginwgoogle.component.css']
})
export class LoginwgoogleComponent implements OnInit {

  constructor(private auth: AngularFireAuth, private router: Router, private conService: ConnectionService) {
    this.conService.monitor().subscribe(isConnected => {
      if(!(isConnected)){
        window.alert('Please check your network connection and try again.');
      }
    })
  }

  googleLogin(){
    this.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(data => {
      console.log(`Logged in successfully.`);
      console.log(`${data}`);
      window.alert(`You're now logged in. Redirecting to your board...`);
      this.router.navigate(['board']);
    }).catch(error => {
      console.log(error);
      if(error == "Error: The popup has been closed by the user before finalizing the operation."){
        window.alert("You are not logged in. You just closed the Google login pop-up.")
      } else {
        window.alert(error);
      }
    })
  }

  ngOnInit(): void {
  }

}
