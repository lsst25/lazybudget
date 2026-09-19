import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField as FormFieldDirective, required } from '@angular/forms/signals';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormField } from './form-field';

@Component({
  imports: [FormFieldDirective, NzInputModule, FormField],
  template: `
    <form>
      <app-form-field [field]="form.name" label="Name" for="name">
        <input nz-input id="name" [formField]="form.name" />
      </app-form-field>
    </form>
  `,
})
class Host {
  readonly model = signal({ name: '' });
  readonly form = form(this.model, (path) => {
    required(path.name, { message: 'Name is required' });
  });
}

describe('FormField', () => {
  async function setup() {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return fixture;
  }

  it('renders the label with a required marker taken from the schema', async () => {
    const fixture = await setup();
    const label = fixture.nativeElement.querySelector('label');

    expect(label?.textContent).toContain('Name');
    expect(label?.getAttribute('for')).toBe('name');
    expect(label?.classList.contains('ant-form-item-required')).toBe(true);
  });

  it('shows nothing while the field is untouched', async () => {
    const fixture = await setup();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.ant-form-item-has-error')).toBeNull();
    expect(el.textContent).not.toContain('Name is required');
  });

  it('turns red and shows the first error once touched and invalid', async () => {
    const fixture = await setup();

    fixture.componentInstance.form.name().markAsTouched();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.ant-form-item-has-error')).not.toBeNull();
    expect(el.querySelector('input')?.classList.contains('ant-input-status-error')).toBe(true);
    expect(el.textContent).toContain('Name is required');
  });

  it('clears the error status when the value becomes valid', async () => {
    const fixture = await setup();
    fixture.componentInstance.form.name().markAsTouched();
    await fixture.whenStable();

    fixture.componentInstance.model.set({ name: 'Household' });
    await fixture.whenStable();

    // The tip itself leaves through an animation, so only the status class is checked here.
    expect(fixture.nativeElement.querySelector('.ant-form-item-has-error')).toBeNull();
  });
});
