import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import Iclip from 'src/app/models/clip.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy,OnChanges {
  @Input() activeClip: Iclip| null = null
  @Output() update = new EventEmitter()

  inSubmission = false
  showAlert=false
  alertColor ='blue'
  alertMsg = 'please wait!'


  clipId: FormControl  = new FormControl('', {
    nonNullable:true
  })


   title =new FormControl('',{
    validators:
  [
    Validators.required,
    Validators.minLength(3)
  ],
  nonNullable: true
})

editForm = new FormGroup({
  title: this.title,
  id: this.clipId
})


  constructor(private modal: ModalService, private clipService: ClipService) { }

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip')
  }
ngOnChanges() {
  if(!this.activeClip){
    return
  }
  this.inSubmission=false
  this.showAlert=false
  this.clipId.setValue(this.activeClip.docId)
  this.title.setValue(this.activeClip.title)
}

async submit()
{
  if (!this.activeClip){
    return
  }
  this.inSubmission =true
  this.showAlert = true
  this.alertColor= 'blue'
  this.alertMsg='please wait!'
  try{
      await this.clipService.upDateClip(this.clipId.value, this.title.value)
  }catch(e){
    this.inSubmission = false
    this.alertColor ="red"
    this.alertMsg ='try later'
    return
  }

  this.activeClip.title = this.title.value
  this.update.emit(this.activeClip)

  this.inSubmission = false
  this.alertColor='green'
  this.alertMsg= 'success!'

}
}
