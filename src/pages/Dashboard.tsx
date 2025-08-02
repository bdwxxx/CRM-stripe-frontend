import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StripeAccountCard } from "@/components/StripeAccountCard";
import { AddAccountModal } from "@/components/AddAccountModal";
import { AccountSettings } from "@/components/AccountSettings";
import { InvoiceStats } from "@/components/InvoiceStats";
import { LayoutDashboard, CreditCard, BarChart3, Settings, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/api/api.service"; 
import { StripeAccount, TransferredInvoice } from "@/api/types";

export function Dashboard() {
  const [accounts, setAccounts] = useState<StripeAccount[]>([]);
  const [transferredInvoices, setTransferredInvoices] = useState<TransferredInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeWorkerAccountId, setActiveWorkerAccountId] = useState<string | null>(null);
  const [settingsAccount, setSettingsAccount] = useState<StripeAccount | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [totalVolume, setTotalVolume] = useState(0);
  const [totalTransfers, setTotalTransfers] = useState(0);

  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const workersData = await api.getWorkers();
      const formattedAccounts = workersData.map((w: any) => ({
        ...w,
        // Заглушки для динамических полей
        grossVolume: 0,
        transferredInvoices: 0,
        lastTransfer: "N/A",
      }));
      setAccounts(formattedAccounts);

      const invoicesData = await api.getTransferredInvoices();
      setTransferredInvoices(invoicesData.invoices);

      if (formattedAccounts.length > 0 && !activeWorkerAccountId) {
        setActiveWorkerAccountId(formattedAccounts[0].accountId);
      }
    } catch (error) {
      toast({ title: "Ошибка загрузки", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setTotalTransfers(transferredInvoices.length);

    const newTotalVolume = transferredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    setTotalVolume(newTotalVolume);

    const updatedAccounts = accounts.map(account => {
        const accountInvoices = transferredInvoices.filter(invoice => invoice.transferredByWorker === account.accountId);
        const accountVolume = accountInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        const lastTransfer = accountInvoices.length > 0 ? new Date(accountInvoices[0].transferDate).toLocaleString('ru-RU') : "N/A";

        return {
            ...account,
            grossVolume: accountVolume,
            transferredInvoices: accountInvoices.length,
            lastTransfer,
        };
    });
    setAccounts(updatedAccounts);

  }, [transferredInvoices]);


  const handleAddAccount = async (newAccountData: { accountId: string; friendlyName: string; workerUrl: string; dailyLimit: number, stripeApiKey: string; }) => {
    try {
      await api.createWorker(newAccountData);
      toast({ title: "Аккаунт добавлен", description: `Воркер "${newAccountData.friendlyName}" успешно создан.` });
      fetchData();
    } catch (error) {
      toast({ title: "Ошибка", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleUpdateAccount = async (accountId: string, updates: { dailyLimit: number }) => {
    try {
      await api.updateWorkerLimit(accountId, updates.dailyLimit);
      toast({ title: "Настройки сохранены", description: "Лимит успешно обновлен." });
      fetchData();
    } catch (error) {
      toast({ title: "Ошибка", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await api.deleteWorker(accountId);
      toast({ title: "Аккаунт удален", variant: "destructive" });
      fetchData();
    } catch (error) {
      toast({ title: "Ошибка", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleSwapAccount = (accountId: string) => {
    setActiveWorkerAccountId(accountId);
  };

  const handleSettings = (accountId: string) => {
    const account = accounts.find((a) => a.accountId === accountId);
    setSettingsAccount(account || null);
    setShowSettings(true);
  };

  const handleRefreshStats = () => {
    toast({ title: "Обновление...", description: "Запрашиваю свежие данные." });
    fetchData();
  };

  const activeAccount = accounts.find(a => a.accountId === activeWorkerAccountId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stripe CRM Dashboard</h1>
            <p className="text-muted-foreground mt-1">Управление аккаунтами и переносом инвойсов</p>
          </div>
          <AddAccountModal onAddAccount={handleAddAccount} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Всего аккаунтов</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
              <p className="text-xs text-muted-foreground">{accounts.filter(a => a.status === "ACTIVE").length} активных</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Общий объём (сегодня)</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalVolume.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Всего переносов</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransfers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Активный аккаунт</CardTitle></CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{activeAccount?.friendlyName || "Не выбран"}</div>
              <p className="text-xs text-muted-foreground">{activeAccount?.accountId || ""}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accounts"><LayoutDashboard className="h-4 w-4 mr-2" />Аккаунты</TabsTrigger>
            <TabsTrigger value="stats"><BarChart3 className="h-4 w-4 mr-2" />Статистика</TabsTrigger>
          </TabsList>
          <TabsContent value="accounts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <div key={account.accountId} className="animate-slide-up">
                  <StripeAccountCard
                    account={account}
                    onSettings={() => handleSettings(account.accountId)}
                    onSwap={() => handleSwapAccount(account.accountId)}
                    isActive={account.accountId === activeWorkerAccountId}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="stats" className="space-y-6">
            <InvoiceStats
              transferredInvoices={transferredInvoices}
              activeAccountId={activeWorkerAccountId || ""}
              onRefresh={handleRefreshStats}
            />
          </TabsContent>
        </Tabs>

        <AccountSettings
          account={settingsAccount}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onUpdate={handleUpdateAccount}
          onDelete={handleDeleteAccount}
        />
      </div>
    </div>
  );
}