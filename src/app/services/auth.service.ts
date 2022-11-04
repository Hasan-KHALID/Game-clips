import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore'
import IUser from '../models/user.model'
import { Observable, of } from 'rxjs'
import { map, delay, filter, switchMap } from 'rxjs/operators'
import { Router } from '@angular/router';
import { ActivatedRoute, NavigationEnd } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userCollection: AngularFirestoreCollection<IUser>
  public isAuthenticated$: Observable<boolean>
  public isAuthenticatedwithDelay$ :Observable<boolean>
  private redirect = false





  constructor(
    private auth: AngularFireAuth, 
    private db: AngularFirestore, 
    private router:Router,
    private route:ActivatedRoute
    ) 

    { 
    
      this.userCollection = db.collection('users')
    this.isAuthenticated$ = auth.user.pipe(
      map(user => !!user)
    )
    this.isAuthenticatedwithDelay$ =this.isAuthenticated$.pipe(
      delay(1000)
    )
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),map(e => this.route.firstChild),
        switchMap(route => route?.data ?? of({}))
      ).subscribe(data => {
        this.redirect = data['authOnly'] ?? false
      })


  }




  public async createUser(userDate:IUser){

    if(!userDate.password){
      throw new Error('password is not provided')
    }

     const userCred = await this.auth.createUserWithEmailAndPassword(
      userDate.email, userDate.password
    )

    if(!userCred.user){

      throw new Error ('user not found')

    }

    await this.userCollection.doc(userCred.user.uid).set({
      name:userDate.name,
      email: userDate.email,
      age: userDate.age,
      phoneNumber:userDate.phoneNumber
    })

    await userCred.user.updateProfile({
      displayName: userDate.name
    })

  }

  public async logOut($event?:Event){
    if($event){
      $event.preventDefault()
    }
    
    await this.auth.signOut()

    if (this.redirect){
      await this.router.navigateByUrl('/')

    }

    

  }
}
