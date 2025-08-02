import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddAccountModalProps {
  onAddAccount: (account: {
    accountId: string;
    friendlyName: string;
    workerUrl: string;
    dailyLimit: number;
    stripeApiKey: string;
  }) => void;
}

export function AddAccountModal({ onAddAccount }: AddAccountModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState({
    accountId: "",
    friendlyName: "",
    workerUrl: "",
    dailyLimit: 10000,
    stripeApiKey: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || !formData.friendlyName || !formData.workerUrl || !formData.stripeApiKey) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" });
      return;
    }

    if (!formData.stripeApiKey.startsWith('sk_')) {
       toast({ title: "Неверный формат ключа", description: "Stripe API ключ должен начинаться с 'sk_live_' или 'sk_test_'", variant: "destructive" });
       return;
    }

    onAddAccount(formData);
    setFormData({ accountId: "", friendlyName: "", workerUrl: "", dailyLimit: 10000, stripeApiKey: "" });
    setIsOpen(false);
    toast({ title: "Аккаунт добавлен", description: `Запрос на создание воркера "${formData.friendlyName}" отправлен.` });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Добавить аккаунт</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Добавить Stripe аккаунт</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="friendlyName">Название (для дашборда) *</Label>
            <Input id="friendlyName" value={formData.friendlyName} onChange={(e) => setFormData(p => ({ ...p, friendlyName: e.target.value }))} placeholder="Main Production" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountId">Account ID (уникальный) *</Label>
            <Input id="accountId" value={formData.accountId} onChange={(e) => setFormData(p => ({ ...p, accountId: e.target.value }))} placeholder="stripe-prod-usd" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workerUrl">URL Воркера (с портом) *</Label>
            <Input id="workerUrl" type="text" value={formData.workerUrl} onChange={(e) => setFormData(p => ({ ...p, workerUrl: e.target.value }))} placeholder="http://192.0.2.10:4000" />
          </div>
                    <div className="space-y-2">
            <Label htmlFor="apiKey">Stripe API Key (Secret) *</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"} // Динамический тип поля
                value={formData.stripeApiKey}
                onChange={(e) => setFormData(p => ({ ...p, stripeApiKey: e.target.value }))}
                placeholder="sk_live_..."
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Ключ будет зашифрован и не будет храниться в открытом виде.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Дневной лимит*</Label>
            <Input id="limit" type="number" value={formData.dailyLimit} onChange={(e) => setFormData(p => ({ ...p, dailyLimit: Number(e.target.value) }))} />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} className="flex-1">Отмена</Button>
            <Button type="submit" className="flex-1">Добавить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}