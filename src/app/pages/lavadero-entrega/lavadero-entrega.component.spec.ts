import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LavaderoEntregaComponent } from './lavadero-entrega.component';

describe('LavaderoEntregaComponent', () => {
  let component: LavaderoEntregaComponent;
  let fixture: ComponentFixture<LavaderoEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LavaderoEntregaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LavaderoEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
