import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizeDataComponent } from './visualize-data.component';

describe('VisualizeDataComponent', () => {
  let component: VisualizeDataComponent;
  let fixture: ComponentFixture<VisualizeDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizeDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
