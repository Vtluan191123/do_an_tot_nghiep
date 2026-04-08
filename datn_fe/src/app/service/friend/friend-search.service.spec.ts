import { TestBed } from '@angular/core/testing';
import { FriendSearchService } from './friend-search.service';

describe('FriendSearchService', () => {
  let service: FriendSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all friends', (done) => {
    service.getAllFriends().subscribe(friends => {
      expect(friends.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should search friends by name', (done) => {
    service.searchFriends('Nguyễn').subscribe(friends => {
      expect(friends.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should get friend profile', (done) => {
    service.getFriendProfile('1').subscribe(profile => {
      expect(profile.id).toBe('1');
      expect(profile.name).toBeDefined();
      done();
    });
  });

  it('should get mutual friends', (done) => {
    service.getMutualFriends('1').subscribe(friends => {
      expect(Array.isArray(friends)).toBe(true);
      done();
    });
  });

  it('should add friend', (done) => {
    service.addFriend('1').subscribe(response => {
      expect(response.success).toBe(true);
      done();
    });
  });
});

