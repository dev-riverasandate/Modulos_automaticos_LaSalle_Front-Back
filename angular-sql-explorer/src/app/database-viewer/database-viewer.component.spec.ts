import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseViewerComponent } from './database-viewer.component';

describe('DatabaseViewerComponent', () => {
  let component: DatabaseViewerComponent;
  let fixture: ComponentFixture<DatabaseViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabaseViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatabaseViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
