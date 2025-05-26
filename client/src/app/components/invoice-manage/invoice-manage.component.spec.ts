import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceManageComponent } from './invoice-manage.component';

describe('InvoiceManageComponent', () => {
  let component: InvoiceManageComponent;
  let fixture: ComponentFixture<InvoiceManageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvoiceManageComponent]
    });
    fixture = TestBed.createComponent(InvoiceManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
