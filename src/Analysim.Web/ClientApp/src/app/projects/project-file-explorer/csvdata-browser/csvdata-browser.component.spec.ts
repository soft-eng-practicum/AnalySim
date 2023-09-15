import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CSVDataBrowserComponent } from './csvdata-browser.component';

describe('CSVDataBrowserComponent', () => {
  let component: CSVDataBrowserComponent;
  let fixture: ComponentFixture<CSVDataBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CSVDataBrowserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CSVDataBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
