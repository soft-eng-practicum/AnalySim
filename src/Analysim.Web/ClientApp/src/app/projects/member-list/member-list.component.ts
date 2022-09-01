import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { Input } from '@angular/core';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent implements OnInit {
    
  constructor() { }

    @Input() project : Project

    async ngOnInit() {}
}