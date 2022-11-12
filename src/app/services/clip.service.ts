import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
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
  import { of, BehaviorSubject, combineLatest } from 'rxjs';
  import { AngularFireStorage } from '@angular/fire/compat/storage';
  import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<Iclip | null> {
  pageClips:Iclip[]=[]
  pendingReq = false

  public clipsCollection : AngularFirestoreCollection<Iclip>

  constructor(
    private db: AngularFirestore, 
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
    ) { 
    this.clipsCollection = db.collection('clips')
  }

  createClip(data:Iclip): Promise<DocumentReference<Iclip>>{
   return this.clipsCollection.add(data)
  }

  getUserClips(sort$: BehaviorSubject<string>){
    return combineLatest ([
      this.auth.user,sort$
    ]).pipe(
      switchMap(values => {

        const [ user, sort]=values
        if(!user){
          return of([])
        }

        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        ).orderBy(
          'timestamp',
          sort === '1' ? 'desc' : 'asc'
        )

        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<Iclip>).docs )
    )
  }

  upDateClip(id: string, title: string){
    return this.clipsCollection.doc(id).update({
      title
    })
  }

  async deleteClip(clip: Iclip){
    const clipRef = this.storage.ref(`clips/${clip.fileName}`)
    const screenshotRef = this.storage.ref(`screenshots/${clip.screenshotFileName}`)

    await clipRef.delete()

    await screenshotRef.delete()

    await this.clipsCollection.doc(clip.docId).delete()
  }

  async getClips(){
    if(this.pendingReq){
      return
    }

    this.pendingReq=true

    let query = this.clipsCollection.ref.orderBy(
      'timestamp', 'desc'
      ).limit(6)
      const { length } = this.pageClips
      if(length){
        const lastDocID = this.pageClips[length-1].docId
        const lastDoc = await this.clipsCollection.doc(lastDocID).get().toPromise()


        query = query.startAfter(lastDoc)
      }
      const snapshot = await query.get()
      snapshot.forEach(doc => {
        this.pageClips.push({
          docId: doc.id,
          ...doc.data()
        })
      })

      this.pendingReq =false
  }

  resolve(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
    ) {
      return this.clipsCollection.doc(route.params['id']).get().
      pipe(
        map(snapshot =>{
          const data = snapshot.data()
          if(!data){
            this.router.navigate(['/'])
            return null
          }
          return data
        })
      )
  }
}
