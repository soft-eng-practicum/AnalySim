import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ExploreService {

  constructor(private router: Router) { }

  exploreProject(tagValue: string){
    const searchTerms: string[] = Array.from(
      new Set(tagValue.split(' ').filter(x => x.length !== 0))
    );
    this.router.navigate(['/explore'], {
      queryParams: { category: 'project', term: JSON.stringify(searchTerms)}
    });
  }
}
