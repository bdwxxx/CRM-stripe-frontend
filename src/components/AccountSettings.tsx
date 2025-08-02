import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StripeAccount } from "@/api/types";

// Интерфейс пропсов, соответствующий функциям в Dashboard
interface AccountSettingsProps {
  account: StripeAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (accountId: string, updates: { dailyLimit: number }) => void;
  onDelete: (accountId: string) => void;
}

export function AccountSettings({ account, isOpen, onClose, onUpdate, onDelete }: AccountSettingsProps) {
  const [formData, setFormData] = useState({ dailyLimit: 0 });
  const { toast } = useToast();

  useEffect(() => {
    if (account) {
      setFormData({
        dailyLimit: account.dailyLimit,
      });
    }
  }, [account]); 

  const handleSave = () => {
    if (!account) return;
    
    onUpdate(account.accountId, formData);
    
    onClose(); 
    toast({
      title: "Настройки сохранены",
      description: "Изменения успешно применены.",
    });
  };

  const handleDelete = () => {
    if (!account) return;

    // Простое подтверждение через стандартный диалог браузера
    if (window.confirm(`Вы уверены, что хотите удалить аккаунт "${account.friendlyName}"? Это действие нельзя отменить.`)) {
      onDelete(account.accountId);
      onClose(); // Закрываем модальное окно
    }
  };

  // Не рендерим ничего, если аккаунт не выбран
  if (!account) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-primary" />
            Настройки аккаунта
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Отображаем нередактируемые поля как простой текст */}
            <div>
                <Label>Название</Label>
                <p className="font-semibold text-lg">{account.friendlyName}</p>
            </div>
            <div>
                <Label>Account ID</Label>
                <p className="font-mono text-sm text-muted-foreground">{account.accountId}</p>
            </div>
            <div>
                <Label>Статус</Label>
                <div><Badge>{account.status}</Badge></div>
            </div>
            
            <Separator />

            {/* Единственное редактируемое поле */}
            <div className="space-y-2">
              <Label htmlFor="editLimit">Дневной лимит (в центах)</Label>
              <Input
                id="editLimit"
                type="number"
                value={formData.dailyLimit}
                onChange={(e) => setFormData({ dailyLimit: Number(e.target.value) || 0 })}
                min="0"
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Статистика (заглушка)</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Переносов:</span>
                <div className="font-medium">{account.transferredInvoices}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Последний перенос:</span>
                <div className="font-medium">{account.lastTransfer}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-primary hover:shadow-glow"
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}