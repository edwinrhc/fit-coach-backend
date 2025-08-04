


export class PageDto<T>{
  readonly items: T[];
  readonly totalItems: number;
  readonly totalPages: number;
  readonly page: number;
  readonly limit: number;

  constructor(items: T[], totalItems: number, pageOptions: { page: number, limit: number }) {
    this.items = items;
    this.totalItems = totalItems;
    this.page = pageOptions.page;
    this.limit = pageOptions.limit;
    this.totalPages = Math.ceil(totalItems / pageOptions.limit);
  }
}