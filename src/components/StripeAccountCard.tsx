import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, TrendingUp, DollarSign } from "lucide-react";
import { StripeAccount } from "@/api/types";
import { Label } from "./ui/label";

interface StripeAccountCardProps {
  account: StripeAccount;
  onSettings: () => void;
  onSwap: () => void;
  isActive?: boolean;
}

export function StripeAccountCard({ account, onSettings, onSwap, isActive = false }: StripeAccountCardProps) {
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{account.friendlyName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge>{account.status}</Badge>
            <Button variant="ghost" size="icon" onClick={onSettings}><Settings className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Лимит в день</Label>
            <p className="text-lg font-semibold">{account.dailyLimit}$</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Объём сегодня</Label>
            <p className="text-lg font-semibold">{account.grossVolume}$</p>
          </div>
        </div>
        <div className="pt-2 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Переносов: {account.transferredInvoices}</div>
            <Button onClick={onSwap} variant={isActive ? "secondary" : "default"} size="sm">
              {isActive ? "Активен" : "Выбрать"}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}