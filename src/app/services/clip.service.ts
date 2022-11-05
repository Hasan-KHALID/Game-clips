import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import Iclip from '../models/clip.model'; 
import { 
  AngularFirestore, 
  AngularFirestoreCollection,
  DocumentReference, 
  QuerySnapshot,
} 
  from '@angular/fire/compat/firestore'
  import { AngularFireAuth } from '@angular/fire/compat/auth';
  import { switchMap, map } from 'rxjs/operators';
  import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClipService {

  public clipsCollection : AngularFirestoreCollection<Iclip>

  constructor(private db: AngularFirestore, private auth: AngularFireAuth) { 
    this.clipsCollection = db.collection('clips')
  }

  creatClip(data:Iclip): Promise<DocumentReference<Iclip>>{
   return this.clipsCollection.add(data)
  }

  getUserClips(){
    return this.auth.user.pipe(
      switchMap(user => {
        if(!user){
          return of([])
        }

        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        )

        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<Iclip>).docs )
    )
  }
}
