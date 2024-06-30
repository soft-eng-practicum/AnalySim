import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetFolderViewComponent } from './dataset-folder-view.component';

describe('DatasetFolderViewComponent', () => {
  let component: DatasetFolderViewComponent;
  let fixture: ComponentFixture<DatasetFolderViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetFolderViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetFolderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
