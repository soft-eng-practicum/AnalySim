import { PipeTransform, Pipe } from "@angular/core";
import { Project } from '../interfaces/project';
import { AccountService } from '../services/account.service';
import { ApplicationUser } from '../interfaces/user';
import { ProjectUser } from '../interfaces/project-user';
import { filter } from 'rxjs/operators';

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
                console.log("Error: Route Pipe")
                return "null";           
        }
    }
}

@Pipe({
    name: 'role',
    pure: false
})
export class RoleFilterPipe implements PipeTransform {
    transform(project: Project, type: string): number {
        switch(type){
            case "follower":
                return project.projectUsers
                    .filter(x => 
                        x.isFollowing == true
                    ).length
            case "member":
                return project.projectUsers
                    .filter(x => 
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
export class TimeElapsedPipe implements PipeTransform {
    transform(lastUpdate: Date): string {
        var timeThen = new Date(lastUpdate)
        var timeNow = new Date()
        var elapsed = Math.floor(timeNow.getTime() - timeThen.getTime())
        var secs = Math.floor(elapsed/1000);
        var mins = Math.floor(secs/60);
        var hours = Math.floor(mins/60);
        var days = Math.floor(hours/24);
        var months = Math.floor(days/31);
        var years = Math.floor(months/12);
    
        if(years > 12){
          return years + " Year"
        }
        else if(months > 0){
          return months + " Month"
        }
        else if(days > 0){
          return days + " Day"
        }
        else if(hours > 0){
          return hours + " Hour"
        }
        else if(mins > 0){
          return mins + " Minute"
        }
        else if(secs > 0){
          return secs + " Second"
        }
    }
}

@Pipe({
    name: 'profileImage',
    pure: false
})
export class ProfileImagePipe implements PipeTransform {
    transform(profile: ApplicationUser): string {
        if(profile.blobFiles.length != 0)
        {
            var blobFile = profile.blobFiles.find(x => x.container == 'profile')
            if(blobFile != null) { return blobFile.uri + "?" + blobFile.dateCreated }
        }  
        return "../../assets/img/default-profile.png"         
    }
}

@Pipe({
    name: 'projectMember',
    pure: false
})
export class ProjectMemberPipe implements PipeTransform {
    transform(projectUsers: ProjectUser[]): ProjectUser[] {
        let filtered = projectUsers.filter(x => {
                return x.userRole == "member" || x.userRole == "admin"
            })
        return filtered
    }
}