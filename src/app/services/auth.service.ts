import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore'
import IUser from '../models/user.model'
import { Observable } from 'rxjs'
import { map, delay } from 'rxjs/operators'


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userCollection: AngularFirestoreCollection<IUser>
  public isAuthenticated$: Observable<boolean>
  public isAuthenticatedwithDelay$ :Observable<boolean>





  constructor(private auth: AngularFireAuth, private db: AngularFirestore) { 
    this.userCollection = db.collection('users')
    this.isAuthenticated$ = auth.user.pipe(
      map(user => !!user)
    )
    this.isAuthenticatedwithDelay$ =this.isAuthenticated$.pipe(
      delay(1000)
    )
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
}
