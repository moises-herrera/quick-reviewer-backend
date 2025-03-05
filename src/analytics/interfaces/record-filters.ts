import { PaginationOptions } from 'src/common/interfaces/pagination-options';

export interface RecordFilters extends PaginationOptions {
  userId: number;
}
