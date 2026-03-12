import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  totalItems?: number;
  totalLabel?: string;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  siblingCount?: number;
  showSummary?: boolean;
};

function getVisiblePages(page: number, totalPages: number, siblingCount: number) {
  const normalizedSiblingCount = Math.max(0, Math.floor(siblingCount));
  const desiredCount = normalizedSiblingCount * 2 + 1;

  let start = Math.max(1, page - normalizedSiblingCount);
  let end = Math.min(totalPages, page + normalizedSiblingCount);

  const currentCount = end - start + 1;
  if (currentCount < desiredCount) {
    const missingCount = desiredCount - currentCount;

    if (start === 1) {
      end = Math.min(totalPages, end + missingCount);
    } else if (end === totalPages) {
      start = Math.max(1, start - missingCount);
    }
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  totalLabel = 'itens',
  onPageChange,
  disabled = false,
  siblingCount = 2,
  showSummary = true,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const isFirstPage = safePage <= 1;
  const isLastPage = safePage >= safeTotalPages;
  const visiblePages = getVisiblePages(safePage, safeTotalPages, siblingCount);

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center ${
        showSummary ? 'sm:justify-between' : 'sm:justify-end'
      }`}
    >
      {showSummary ? (
        <div className="text-xs text-muted-foreground">
          <p>
            Página {safePage} de {safeTotalPages}
          </p>
          {typeof totalItems === 'number' ? (
            <p>
              Total: {totalItems} {totalLabel}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={`flex flex-wrap items-center gap-1 ${showSummary ? '' : 'justify-center'} sm:justify-end`}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="px-2"
          onClick={() => onPageChange(1)}
          disabled={disabled || isFirstPage}
          aria-label="Ir para a primeira página"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="px-2"
          onClick={() => onPageChange(safePage - 1)}
          disabled={disabled || isFirstPage}
          aria-label="Ir para a página anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {visiblePages.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === safePage ? 'default' : 'outline'}
            size="sm"
            className="min-w-9 px-2"
            onClick={() => onPageChange(pageNumber)}
            disabled={disabled}
            aria-current={pageNumber === safePage ? 'page' : undefined}
            aria-label={`Ir para a página ${pageNumber}`}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="px-2"
          onClick={() => onPageChange(safePage + 1)}
          disabled={disabled || isLastPage}
          aria-label="Ir para a próxima página"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="px-2"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={disabled || isLastPage}
          aria-label="Ir para a última página"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
