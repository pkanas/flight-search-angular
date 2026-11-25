import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Returns the current local date as a 'YYYY-MM-DD' string.
 * `type="date"` inputs produce this format, so the strings can be compared
 * directly.
 */
export function todayAsISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Validator for `type="date"` controls: ensures the value is in the future.
 * Empty values are ignored, so `Validators.required` stays responsible for them.
 */
export function mustBeFutureDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '') as string;
    if (!value) {
      return null;
    }
    return value <= todayAsISO() ? { mustBeFutureDate: true } : null;
  };
}
