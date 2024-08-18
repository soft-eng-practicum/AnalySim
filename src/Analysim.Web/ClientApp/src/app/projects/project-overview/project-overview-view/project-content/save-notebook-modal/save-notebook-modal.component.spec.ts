import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveNotebookModalComponent } from './save-notebook-modal.component';

describe('SaveNotebookModalComponent', () => {
  let component: SaveNotebookModalComponent;
  let fixture: ComponentFixture<SaveNotebookModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveNotebookModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveNotebookModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
