import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import Iclip from '../models/clip.model'; 
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore'

@Injectable({
  providedIn: 'root'
})
export class ClipService {

  public clipsCollection : AngularFirestoreCollection<Iclip>

  constructor(private db: AngularFirestore) { 
    this.clipsCollection = db.collection('clips')
  }

  async creatClip(data:Iclip){
   await this.clipsCollection.add(data)
  }
}
