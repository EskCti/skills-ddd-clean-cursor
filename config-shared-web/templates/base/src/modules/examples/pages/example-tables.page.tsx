'use client';

import { useMemo, useState } from 'react';
import {
  Input,
  PageSectionHeader,
  PaginationControls,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCard,
} from '@/shared';

type OrderStatus = 'Pago' | 'Pendente' | 'Em análise';

type OrderRow = {
  id: string;
  customer: string;
  status: OrderStatus;
  total: string;
};

const rows: OrderRow[] = [
  { id: 'PED-001', customer: 'Ana Souza', status: 'Pago', total: 'R$ 320,00' },
  { id: 'PED-002', customer: 'Lucas Lima', status: 'Pendente', total: 'R$ 89,00' },
  { id: 'PED-003', customer: 'Aline Costa', status: 'Pago', total: 'R$ 1.240,00' },
  { id: 'PED-004', customer: 'Tiago Alves', status: 'Em análise', total: 'R$ 420,00' },
  { id: 'PED-005', customer: 'Julia Mendes', status: 'Pago', total: 'R$ 215,00' },
  { id: 'PED-006', customer: 'Bruno Rocha', status: 'Pendente', total: 'R$ 560,00' },
];

const PAGE_SIZE = 3;

export function ExampleTablesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) {
      return rows;
    }

    return rows.filter((item) => [item.id, item.customer, item.status].join(' ').toLowerCase().includes(normalized));
  }, [search]);

  const safeTotalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), safeTotalPages);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  function onChangePage(nextPage: number) {
    const safePage = Math.min(Math.max(1, Math.floor(nextPage)), safeTotalPages);
    if (safePage !== page) {
      setPage(safePage);
    }
  }

  return (
    <div className="space-y-6">
      <PageSectionHeader
        badge="Tabelas"
        title="Tabela com Navegação"
        subtitle="Estrutura de tabela seguindo o mesmo padrão aplicado em usuários."
        aside={
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Filtrar por Pedido, Cliente ou Status"
            className="sm:max-w-sm"
          />
        }
      />

      <TableCard
        footer={
          <PaginationControls
            page={currentPage}
            totalPages={safeTotalPages}
            onPageChange={onChangePage}
            siblingCount={1}
            showSummary={false}
          />
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 md:px-6">Pedido</TableHead>
              <TableHead className="hidden px-5 md:table-cell md:px-6">Cliente</TableHead>
              <TableHead className="hidden px-5 xl:table-cell md:px-6">Status</TableHead>
              <TableHead className="px-5 text-right md:px-6">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 font-medium md:px-6">
                    <div className="min-w-0 space-y-0.5">
                      <span className="block min-w-0 truncate">{item.id}</span>
                      <span className="block truncate text-xs font-normal text-muted-foreground md:hidden">
                        {item.customer}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden px-5 md:table-cell md:px-6">{item.customer}</TableCell>
                  <TableCell className="hidden px-5 xl:table-cell md:px-6">{item.status}</TableCell>
                  <TableCell className="px-5 text-right md:px-6">{item.total}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableCard>
    </div>
  );
}
