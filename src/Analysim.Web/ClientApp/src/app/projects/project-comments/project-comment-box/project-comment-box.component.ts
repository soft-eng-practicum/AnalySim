import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-project-comment-box',
  templateUrl: './project-comment-box.component.html',
  styleUrls: ['./project-comment-box.component.scss']
})
export class ProjectCommentBoxComponent implements OnInit {
  @Input() parentId?: number;
  @Input() parentName?: string;
  @Input() editingContent?: string;
  
  @Output() submitComment? = new EventEmitter<string>();
  @Output() cancelReply = new EventEmitter<void>();
  @Output() submitEdit? = new EventEmitter<string>();
  @Output() cancelEdit? = new EventEmitter<void>();

  placeholder = "Write a comment...";
  content = "";
  isEditing = false;

  constructor() { }

  ngOnInit(): void {
    if(this.parentId && this.parentName) {
      this.placeholder = `Replying to ${this.parentName}...`
    }
    if(this.editingContent) {
      this.content = this.editingContent;
      this.isEditing = true;
    }
  }

  onClear(): void {
    if(this.isEditing){
      this.cancelEdit.emit();
      return;
    }

    if(this.parentId){
      this.cancelReply.emit();
    } else {
      this.content = "";
    }
  }

  onPost(): void {
    const trimmed = this.content.trim();
    if (!trimmed) return;

    if(this.isEditing) {
      this.submitEdit.emit(trimmed); 
      return;
    }
    
    this.submitComment.emit(trimmed);
    this.onClear();
  }

}
