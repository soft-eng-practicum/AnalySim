import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotebooksComponent } from './notebooks.component';

describe('NotebooksComponent', () => {
  let component: NotebooksComponent;
  let fixture: ComponentFixture<NotebooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotebooksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotebooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
