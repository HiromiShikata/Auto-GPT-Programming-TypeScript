import { DateTimeRepository } from '../../domain/usecases/adapter-interfaces/DateTimeRepository';
import dayjs from 'dayjs';

export class SystemDateTimeRepository implements DateTimeRepository {
  now = (): Date => {
    return new Date();
  };

  yyyyMMddHHmm = (): string => {
    return dayjs().format('YYYYMMDD-HHmm');
  };
}
