import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleBadgeComponent } from './role-badge.component';

describe('RoleBadgeComponent', () => {
  let fixture: ComponentFixture<RoleBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RoleBadgeComponent] }).compileComponents();
    fixture = TestBed.createComponent(RoleBadgeComponent);
  });

  it('renders the given role', () => {
    fixture.componentRef.setInput('role', 'UPDATE');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('UPDATE');
  });
});