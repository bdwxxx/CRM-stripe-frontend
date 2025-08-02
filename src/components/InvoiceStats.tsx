import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, RefreshCw, Download } from "lucide-react";
import { TransferredInvoice } from "@/api/types";
import { CSVLink } from "react-csv";

interface InvoiceStatsProps {
  transferredInvoices: TransferredInvoice[];
  activeAccountId: string | null; // Допускаем null, если "все аккаунты"
  onRefresh: () => void;
}

export function InvoiceStats({ transferredInvoices, activeAccountId, onRefresh }: InvoiceStatsProps) {
  const filteredInvoices = useMemo(() => {
    // Если ID не выбран (режим "все аккаунты"), показываем всё.
    if (!activeAccountId) {
      return transferredInvoices;
    }
    // Логика фильтрации теперь работает, т.к. бэкенд отдает ID
    return transferredInvoices.filter(
      (invoice) => invoice.transferredByWorker === activeAccountId
    );
  }, [transferredInvoices, activeAccountId]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const displayCurrency = filteredInvoices[0]?.currency || 'usd';

  const csvHeaders = [
    { label: "ID Инвойса Stripe", key: "stripeInvoiceId" },
    { label: "Сумма", key: "amount" },
    { label: "Валюта", key: "currency" },
    { label: "Дата переноса", key: "transferDate" },
    { label: "ID Воркера", key: "transferredByWorker" },
    { label: "Имя Воркера", key: "workerFriendlyName" }, // Если добавили на бэке
    { label: "ID лога", key: "logId" },
  ];

  // ИСПРАВЛЕНИЕ: Экспортируем только отфильтрованные данные
  const dataForCsv = filteredInvoices.map(invoice => ({
    ...invoice,
    transferDate: new Date(invoice.transferDate).toLocaleString('ru-RU')
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Всего переносов (для выбранного)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{filteredInvoices.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Общая сумма</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAmount, displayCurrency)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Детальный список переносов</CardTitle>
              <p className="text-sm text-muted-foreground pt-1">
                {activeAccountId ? `Показаны переносы для аккаунта: ${activeAccountId}` : 'Показаны все переносы'}
              </p>
            </div>
            {/* ИСПРАВЛЕНИЕ: Объединили кнопки в один блок */}
            <div className="flex items-center gap-2">
              <CSVLink
                data={dataForCsv}
                headers={csvHeaders}
                filename={`stripe-invoices-export-${new Date().toISOString().slice(0, 10)}.csv`}
                target="_blank"
              >
                 <Button variant="outline" size="sm" disabled={filteredInvoices.length === 0}>
                   <Download className="h-4 w-4 mr-2" />
                   Экспорт в CSV
                 </Button>
              </CSVLink>
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Обновить
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {filteredInvoices.length === 0 ? (
              <p className="text-center text-muted-foreground pt-4">Нет данных о переносах для этого аккаунта</p>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.logId}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm">{invoice.stripeInvoiceId}</p>
                        <p className="font-semibold text-lg">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(invoice.transferDate).toLocaleString('ru-RU')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {/* Используем ID, так как он теперь приходит с бэка */}
                          Перенес: {invoice.transferredByWorker}
                        </p>
                      </div>
                      <Button asChild variant="ghost" size="icon">
                        <a href={`https://dashboard.stripe.com/invoices/${invoice.stripeInvoiceId}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <Separator className="mt-2"/>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}