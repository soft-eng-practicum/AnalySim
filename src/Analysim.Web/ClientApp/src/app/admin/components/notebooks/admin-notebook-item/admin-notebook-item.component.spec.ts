import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNotebookItemComponent } from './admin-notebook-item.component';

describe('AdminNotebookItemComponent', () => {
  let component: AdminNotebookItemComponent;
  let fixture: ComponentFixture<AdminNotebookItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminNotebookItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNotebookItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
