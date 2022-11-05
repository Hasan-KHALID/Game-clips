import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid'
import { last, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import Firebase from 'firebase/compat/app'
import { ClipService } from 'src/app/services/clip.service';



@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})


export class UploadComponent implements OnInit {

  isDrageover = false
  file: File | null = null
  nextStep = false
  showAlert = false
  alertColor ='blue'
  alertMsg = 'Please wait your clip is being uploaded'
  inSubmission = false
  percentage = 0
  showPercentage= false
  user: Firebase.User | null =null




  title =new FormControl('',{
    validators:
  [
    Validators.required,
    Validators.minLength(3)
  ],
  nonNullable: true
})


uploadForm = new FormGroup({
  title: this.title
})

  constructor(
    private storage: AngularFireStorage, 
    private auth: AngularFireAuth, 
    private clipsService: ClipService)  {

    auth.user.subscribe(user => this.user = user)
   }

  ngOnInit(): void {
  }

  storeFile($event: Event){
    console.log($event)
    this.isDrageover=false

    this.file = ($event as DragEvent).dataTransfer ?
    ($event as DragEvent).dataTransfer?.files.item(0)?? null :
    ($event.target as HTMLInputElement).files?.item(0) ?? null
    if (!this.file||this.file.type !== 'video/mp4'){
      return
    }
    
    this.title.setValue(this.file.name.replace (/\.[^/.]+$/, ''))
    this.nextStep = true
  }

  uploadFile(){

    this.uploadForm.disable()

    this.showAlert =true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait your clip is being uploaded'
    this.inSubmission = true
    this.showPercentage= true
    


    const clipFileName = uuid() 
    const clipPath = `clips/${clipFileName}.mp4`

    const task = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)

    console.log('upload')
    task.percentageChanges().subscribe( progress =>{
      this.percentage = progress as number / 100
    })

    task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipRef.getDownloadURL())
    ).subscribe({
      next: (url)=>{
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${clipFileName}.mp4`,
          url

        }
        this.clipsService.creatClip(clip)

        console.log(clip)
        this.alertColor = 'green'
        this.alertMsg = ' success!Upload completed'
        this.showPercentage= false

      },
      error: (error) =>{
        this.uploadForm.enable()
        this.alertColor= 'red'
        this.alertMsg = 'Failed. tyr again later'
        this.inSubmission =true
        this.showPercentage= false
        console.log(error)
      }
    })

  }

}
