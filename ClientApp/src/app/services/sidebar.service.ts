import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  sideBarToggle = new BehaviorSubject<boolean>(false);

  constructor() { }

  toggle(){
    this.sideBarToggle.next(!this.sideBarToggle.value)
  }

  get isToggled(){
    return this.sideBarToggle;
  }
}
