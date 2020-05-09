import { PipeTransform, Pipe } from "@angular/core";
import { Project } from './interfaces/project';

@Pipe({
    name: 'route'
})
export class RoutePipe implements PipeTransform {
    transform(route: string, type: string): string{
        switch(type){
            case "owner":
                return route.split("/")[0];
            case "projectname":
                return route.split("/")[1];
            default:
                return "null";           
        }
        
    }
}

@Pipe({
    name: 'role'
})
export class RoleFilterPipe implements PipeTransform {
    transform(project: Project, type: string): number {
        switch(type){
            case "follower":
                return project.projectUsers.filter(x => 
                    x.isFollowing == true
                  ).length
            case "member":
                return project.projectUsers.filter(x => 
                    x.userRole == 'owner' || 
                    x.userRole == 'admin' || 
                    x.userRole == 'member'
                  ).length
            default:
                return 0
            
        }
    }
}

@Pipe({
    name: 'timeElapsed'
})
export class timeElapsedPipe implements PipeTransform {
    transform(lastUpdate: Date): string {
        var timeNow = new Date()
        var timeThen = new Date(lastUpdate)
        var elapsed = new Date(timeNow.getTime() - timeThen.getTime())
    
        if(elapsed.getMonth() > 12){
          return Math.floor(elapsed.getMonth() / 12) + " Year"
        }
        else if(elapsed.getMonth() > 0){
          return elapsed.getMonth()+ " Month"
        }
        else if(elapsed.getDay() > 0){
          return elapsed.getDay() + " Day"
        }
        else if(elapsed.getHours() > 0){
          return elapsed.getHours() + " Hour"
        }
        else if(elapsed.getMinutes() > 0){
          return elapsed.getMinutes() + " Minute"
        }
        else if(elapsed.getSeconds() > 0){
          return elapsed.getSeconds() + " Second"
        }
    }
}