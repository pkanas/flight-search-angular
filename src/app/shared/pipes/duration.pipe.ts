import { Pipe, PipeTransform } from '@angular/core';

/** Formats a number of minutes as e.g. "4h 50m" or "45m". */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    if (typeof minutes !== 'number' || Number.isNaN(minutes)) {
      return '';
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
}
