import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendSearchComponent } from './friend-search.component';

describe('FriendSearchComponent', () => {
  let component: FriendSearchComponent;
  let fixture: ComponentFixture<FriendSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all friends on init', () => {
    expect(component.friends.length).toBeGreaterThan(0);
  });

  it('should filter friends by search query', () => {
    component.searchQuery = 'Nguyễn';
    component.onSearchChange();
    expect(component.filteredFriends.length).toBeGreaterThan(0);
  });
});

