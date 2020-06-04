import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-dashboard-quickstart',
  templateUrl: './dashboard-quickstart.component.html',
  styleUrls: ['./dashboard-quickstart.component.css']
})
export class DashboardQuickstartComponent implements OnInit {

  constructor(private accountService : AccountService) { }

  userID : number
  projects : Project[] = null

  ngOnInit(): void {
    
    this.accountService.getProjectList(this.userID).subscribe(
      result =>{
        //this.projects = result
      }, error =>{
        console.log(error)
      }
    )
  }

}
