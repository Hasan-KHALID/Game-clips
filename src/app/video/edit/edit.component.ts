import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import Iclip from 'src/app/models/clip.model';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy {
  @Input() activeClip: Iclip| null = null

  constructor(private modal: ModalService) { }

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip')
  }

}
