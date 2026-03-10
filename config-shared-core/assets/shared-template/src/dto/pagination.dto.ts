export interface PaginatedInputDTO {
  page: number;
  pageSize: number;
}

export interface PaginationMetaDTO {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResultDTO<T> {
  data: T[];
  meta: PaginationMetaDTO;
}
