export interface DateTimeRepository {
  now(): Date;
  yyyyMMddHHmm(date: Date): string;
}
