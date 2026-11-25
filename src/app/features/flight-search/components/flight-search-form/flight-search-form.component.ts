import { Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { FlightSearchParams } from '../../models/flight-search.model';
import { mustBeFutureDate } from '../../../../shared/utils/date.utils';

/** Group-level validator: if both dates are set, the return date must be after departure. */
function returnDateAfterDeparture(group: AbstractControl): ValidationErrors | null {
  const departure = group.get('departureDate')?.value as string | null;
  const returnDate = group.get('returnDate')?.value as string | null;
  if (!departure || !returnDate) {
    return null;
  }
  return returnDate <= departure ? { returnBeforeDeparture: true } : null;
}


@Component({
  selector: 'app-flight-search-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './flight-search-form.component.html',
  styleUrl: './flight-search-form.component.scss',
})
export class FlightSearchFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly searching = input(false);
  readonly initialParams = input<FlightSearchParams | null>(null);
  readonly searchRequested = output<FlightSearchParams>();

  constructor() {
    effect(() => {
      const params = this.initialParams();
      if (params) {
        this.searchForm.patchValue({
          origin: params.origin,
          destination: params.destination,
          departureDate: params.departureDate,
          returnDate: params.returnDate ?? '',
          passengers: params.passengers,
        });
      }
    });
  }

  readonly searchForm: FormGroup = this.formBuilder.group(
    {
      origin: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      destination: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      departureDate: ['', [Validators.required, mustBeFutureDate()]],
      returnDate: [''],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(9)]],
    },
    { validators: [returnDateAfterDeparture] },
  );

  private readonly labels: Record<string, string> = {
    origin: 'From',
    destination: 'To',
    departureDate: 'Departure date',
    returnDate: 'Return date',
    passengers: 'Number of passengers',
  };

  protected onSearch(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.searchRequested.emit(this.searchForm.getRawValue() as FlightSearchParams);
  }


  protected invalid(name: string): boolean {
    const control = this.searchForm.get(name);
    return control?.touched === true && control.invalid;
  }

  protected errorMessage(name: string): string {
    const control = this.searchForm.get(name);
    const errors = control?.errors ?? {};
    const label = this.labels[name] ?? name;

    if (errors['required']) return `${label} is required.`;
    if (errors['minlength']) return `${label} must be at least ${errors['minlength'].minlength} characters.`;
    if (errors['maxlength']) return `${label} must be at most ${errors['maxlength'].maxlength} characters.`;
    if (errors['min']) return `${label} must be at least ${errors['min'].min}.`;
    if (errors['max']) return `${label} must be at most ${errors['max'].max}.`;
    if (errors['mustBeFutureDate']) return 'Please select a date in the future.';
    return '';
  }
}
