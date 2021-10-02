import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerRoomComponent } from './manager-room.component';

describe('ManagerRoomComponent', () => {
  let component: ManagerRoomComponent;
  let fixture: ComponentFixture<ManagerRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagerRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
