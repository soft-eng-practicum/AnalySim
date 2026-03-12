import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNotebookItemDisplayComponent } from './admin-notebook-item-display.component';

describe('AdminNotebookItemDisplayComponent', () => {
  let component: AdminNotebookItemDisplayComponent;
  let fixture: ComponentFixture<AdminNotebookItemDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminNotebookItemDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNotebookItemDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
