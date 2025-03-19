import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerizieComponent } from './perizie.component';

describe('PerizieComponent', () => {
  let component: PerizieComponent;
  let fixture: ComponentFixture<PerizieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerizieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerizieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
