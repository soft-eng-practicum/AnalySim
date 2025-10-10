import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetActionsComponent } from './dataset-actions.component';

describe('DatasetActionsComponent', () => {
  let component: DatasetActionsComponent;
  let fixture: ComponentFixture<DatasetActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetActionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
