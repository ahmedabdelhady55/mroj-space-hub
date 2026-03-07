import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Star, Save, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SETTINGS_KEY = "moroug_admin_settings";

export interface LoyaltySettings {
  pointsPerAmount: number;     // e.g. 10 points
  amountForPoints: number;     // e.g. per 100 EGP
  minRedeemPoints: number;     // minimum points to redeem
  pointValue: number;          // 1 point = X EGP discount
}

export const getSettings = (): LoyaltySettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) return JSON.parse(stored);
  return { pointsPerAmount: 10, amountForPoints: 100, minRedeemPoints: 50, pointValue: 1 };
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<LoyaltySettings>(getSettings);
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    toast({ title: "تم حفظ الإعدادات ✅" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-foreground font-cairo flex items-center gap-2">
        <Settings className="w-5 h-5 text-accent" /> الإعدادات
      </h2>

      {/* Loyalty Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border space-y-6">
        <h3 className="font-bold text-card-foreground font-cairo flex items-center gap-2">
          <Star className="w-5 h-5 text-accent" /> إعدادات نقاط الولاء
        </h3>

        <div className="space-y-4">
          <div className="bg-muted rounded-xl p-4">
            <p className="text-sm font-cairo text-muted-foreground mb-3">نسبة النقاط</p>
            <div className="flex items-center gap-3 font-cairo">
              <span className="text-sm text-card-foreground">كل</span>
              <Input type="number" value={settings.amountForPoints} onChange={e => setSettings({ ...settings, amountForPoints: +e.target.value })}
                className="w-24 text-center font-cairo" />
              <span className="text-sm text-card-foreground">ج.م =</span>
              <Input type="number" value={settings.pointsPerAmount} onChange={e => setSettings({ ...settings, pointsPerAmount: +e.target.value })}
                className="w-24 text-center font-cairo" />
              <span className="text-sm text-card-foreground">نقطة</span>
            </div>
          </div>

          <div className="bg-muted rounded-xl p-4">
            <p className="text-sm font-cairo text-muted-foreground mb-3">الحد الأدنى لاستخدام النقاط</p>
            <div className="flex items-center gap-3 font-cairo">
              <Input type="number" value={settings.minRedeemPoints} onChange={e => setSettings({ ...settings, minRedeemPoints: +e.target.value })}
                className="w-24 text-center font-cairo" />
              <span className="text-sm text-card-foreground">نقطة كحد أدنى للاستبدال</span>
            </div>
          </div>

          <div className="bg-muted rounded-xl p-4">
            <p className="text-sm font-cairo text-muted-foreground mb-3">قيمة النقطة الواحدة</p>
            <div className="flex items-center gap-3 font-cairo">
              <span className="text-sm text-card-foreground">1 نقطة =</span>
              <Input type="number" step="0.5" value={settings.pointValue} onChange={e => setSettings({ ...settings, pointValue: +e.target.value })}
                className="w-24 text-center font-cairo" />
              <span className="text-sm text-card-foreground">ج.م خصم</span>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-accent" />
              <span className="font-bold font-cairo text-card-foreground text-sm">ملخص</span>
            </div>
            <p className="text-sm font-cairo text-muted-foreground">
              العميل يحصل على <strong className="text-accent">{settings.pointsPerAmount} نقطة</strong> لكل <strong>{settings.amountForPoints} ج.م</strong> إنفاق.
              {" "}عند تجميع <strong className="text-accent">{settings.minRedeemPoints} نقطة</strong> يمكنه استبدالها بخصم قيمته <strong>{settings.minRedeemPoints * settings.pointValue} ج.م</strong>.
            </p>
          </div>
        </div>

        <Button variant="hero" size="lg" className="w-full" onClick={handleSave}>
          <Save className="w-5 h-5" /> حفظ الإعدادات
        </Button>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
