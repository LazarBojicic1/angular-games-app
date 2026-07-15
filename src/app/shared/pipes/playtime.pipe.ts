import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'playtime',
  standalone: true
})
export class PlaytimePipe implements PipeTransform {
  transform(value: number | null | undefined, longLabel = false): string {
    if (!value || value < 1) {
      return 'N/A';
    }

    return `${value} ${longLabel ? (value === 1 ? 'hour' : 'hours') : 'h'}`;
  }
}
