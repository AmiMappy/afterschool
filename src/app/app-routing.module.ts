import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BoardComponent } from './board/board.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { LoginwgoogleComponent } from './loginwgoogle/loginwgoogle.component';

import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AuthGuard } from './auth.guard';
import { SecureInnerPagesGuard } from './secure-inner-pages.guard';
import { AuthService } from './auth.service';
import { AskComponent } from './ask/ask.component';
import { ReplyComponent } from './reply/reply.component';
import { SettingsComponent } from './settings/settings.component';
import { redirectUnauthorizedTo, canActivate } from '@angular/fire/auth-guard';


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'google', component: LoginwgoogleComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'board', component: BoardComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'ask', component: AskComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'board/reply', component: ReplyComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'settings', component: SettingsComponent, ...canActivate(redirectUnauthorizedToLogin)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, SecureInnerPagesGuard, AuthService]
})
export class AppRoutingModule { }
