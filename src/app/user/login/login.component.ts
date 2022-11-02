import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials={
    email:'',
    password:''
  }

  showAlert =false
  alertMeg =' please wait we are login'
  alertColor ='blue'
  inSubmission = false

  constructor(private auth: AngularFireAuth) { }

  ngOnInit(): void {
  }

  async logIn(){
    this.showAlert =true
    this.alertMeg='please wait we ar log in'
    this.alertColor='blue'
    this.inSubmission = true
    try{
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email, this.credentials.password
      )
    }catch(e){
      this.inSubmission=false
      this.alertMeg='error'
      this.alertColor='red'

      console.log(e)
      return
    }

    this.alertMeg='you are logedIn'
    this.alertColor='green'
  }

}
