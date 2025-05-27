import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({ name: 'timestampToDate' })
export class TimestampToDatePipe implements PipeTransform {
  transform(value: any): Date | null {
    if (value instanceof Date) return value;
    if (value?.toDate) return value.toDate();
    return null;
  }
}
