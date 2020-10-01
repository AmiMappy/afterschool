import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginwgoogleComponent } from './loginwgoogle.component';

describe('LoginwgoogleComponent', () => {
  let component: LoginwgoogleComponent;
  let fixture: ComponentFixture<LoginwgoogleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginwgoogleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginwgoogleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
