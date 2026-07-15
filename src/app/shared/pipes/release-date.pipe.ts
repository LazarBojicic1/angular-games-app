import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'releaseDate',
  standalone: true
})
export class ReleaseDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return 'Release TBA';
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return 'Release TBA';
    }

    return new Intl.DateTimeFormat('en', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
}
