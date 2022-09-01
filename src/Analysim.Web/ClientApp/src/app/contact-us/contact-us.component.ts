import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: 'contact-us.component.html',
  styleUrls: ['contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  contactForm: FormGroup;
  emailAddress: FormControl;
  message: FormControl;

  constructor(private formBuilder : FormBuilder,
    private notfi : NotificationService) { }

  ngOnInit() {
    // Initialize Form Controls
    this.emailAddress = new FormControl('', [Validators.required, Validators.email]);
    this.message = new FormControl('', [Validators.required, Validators.maxLength(300), Validators.minLength(20)]);

     // Initialize FormGroup using FormBuilder
    this.contactForm = this.formBuilder.group({
        emailAddress : this.emailAddress,
        message : this.message
    });

  }

  onSubmit(){
    this.contactForm.reset();
    // Send registration notification
    this.notfi.showSuccess('Thank you for your response', 'Message Sent');
  }

}
