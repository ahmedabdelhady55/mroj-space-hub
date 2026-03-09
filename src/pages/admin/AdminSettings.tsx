import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Star, Save, Gift, Loader2, Lock, Eye, EyeOff, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings = () => {
  const [settings, setSettings] = useState<{
    id: string;
    points_per_amount: number;
    amount_for_points: number;
    min_redeem_points: number;
    point_value: number;
    vodafone_cash_number: string;
    public_area_price_per_hour?: number;
    daily_code: string;
  }>({
    id: "",
    points_per_amount: 10,
    amount_for_points: 100,
    min_redeem_points: 50,
    point_value: 1,
    vodafone_cash_number: "",
    daily_code: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    supabase.from("loyalty_settings").select("*").limit(1).single().then(({ data, error }) => {
      console.log("Loyalty settings loaded:", data, error);
      if (data) {
        setSettings({
          id: data.id,
          points_per_amount: data.points_per_amount,
          amount_for_points: data.amount_for_points,
          min_redeem_points: data.min_redeem_points,
          point_value: data.point_value,
          vodafone_cash_number: data.vodafone_cash_number || "",
          public_area_price_per_hour: data.public_area_price_per_hour,
          daily_code: data.daily_code || "",
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("loyalty_settings").update({
      points_per_amount: settings.points_per_amount,
      amount_for_points: settings.amount_for_points,
      min_redeem_points: settings.min_redeem_points,
      point_value: settings.point_value,
      vodafone_cash_number: settings.vodafone_cash_number,
      daily_code: settings.daily_code,
    }).eq("id", settings.id);
    console.log("Save result:", error);
    setSaving(false);
    toast({ title: "تم حفظ الإعدادات ✅" });
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ title: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "كلمة المرور الجديدة غير متطابقة", variant: "destructive" });
      return;
    }

    setChangingPassword(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      toast({ title: "حدث خطأ، يرجى المحاولة لاحقاً", variant: "destructive" });
      setChangingPassword(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      toast({ title: "كلمة المرور القديمة غير صحيحة", variant: "destructive" });
      setChangingPassword(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);

    if (updateError) {
      toast({ title: "فشل تغيير كلمة المرور: " + updateError.message, variant: "destructive" });
    } else {
      toast({ title: "تم تغيير كلمة المرور بنجاح ✅" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold text-foreground font-cairo flex items-center gap-2">
        <Settings className="w-5 h-5 text-accent" /> الإعدادات
      </h2>

      {/* Loyalty Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-4 sm:p-6 border border-border space-y-5">
        <h3 className="font-bold text-card-foreground font-cairo flex items-center gap-2 text-sm sm:text-base">
          <Star className="w-5 h-5 text-accent" /> إعدادات نقاط الولاء
        </h3>

        <div className="space-y-4">
          <div className="bg-muted rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-cairo text-muted-foreground mb-3">نسبة النقاط</p>
            <div className="flex flex-wrap items-center gap-2 font-cairo">
              <span className="text-xs sm:text-sm text-card-foreground">كل</span>
              <Input type="number" value={settings.amount_for_points} onChange={e => setSettings({ ...settings, amount_for_points: +e.target.value })}
                className="w-20 sm:w-24 text-center font-cairo text-sm" />
              <span className="text-xs sm:text-sm text-card-foreground">ج.م =</span>
              <Input type="number" value={settings.points_per_amount} onChange={e => setSettings({ ...settings, points_per_amount: +e.target.value })}
                className="w-20 sm:w-24 text-center font-cairo text-sm" />
              <span className="text-xs sm:text-sm text-card-foreground">نقطة</span>
            </div>
          </div>

          <div className="bg-muted rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-cairo text-muted-foreground mb-3">الحد الأدنى لاستخدام النقاط</p>
            <div className="flex flex-wrap items-center gap-2 font-cairo">
              <Input type="number" value={settings.min_redeem_points} onChange={e => setSettings({ ...settings, min_redeem_points: +e.target.value })}
                className="w-20 sm:w-24 text-center font-cairo text-sm" />
              <span className="text-xs sm:text-sm text-card-foreground">نقطة كحد أدنى للاستبدال</span>
            </div>
          </div>

          <div className="bg-muted rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-cairo text-muted-foreground mb-3">قيمة النقطة الواحدة</p>
            <div className="flex flex-wrap items-center gap-2 font-cairo">
              <span className="text-xs sm:text-sm text-card-foreground">1 نقطة =</span>
              <Input type="number" step="0.5" value={settings.point_value} onChange={e => setSettings({ ...settings, point_value: +e.target.value })}
                className="w-20 sm:w-24 text-center font-cairo text-sm" />
              <span className="text-xs sm:text-sm text-card-foreground">ج.م خصم</span>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-accent" />
              <span className="font-bold font-cairo text-card-foreground text-xs sm:text-sm">ملخص</span>
            </div>
            <p className="text-xs sm:text-sm font-cairo text-muted-foreground leading-relaxed">
              العميل يحصل على <strong className="text-accent">{settings.points_per_amount} نقطة</strong> لكل <strong>{settings.amount_for_points} ج.م</strong> إنفاق.
              {" "}عند تجميع <strong className="text-accent">{settings.min_redeem_points} نقطة</strong> يمكنه استبدالها بخصم قيمته <strong>{settings.min_redeem_points * settings.point_value} ج.م</strong>.
            </p>
          </div>

          {/* Vodafone Cash Wallet */}
          <div className="bg-muted rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-cairo text-muted-foreground mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-accent" /> رقم محفظة فودافون كاش
            </p>
            <Input
              type="tel"
              value={settings.vodafone_cash_number}
              onChange={e => setSettings({ ...settings, vodafone_cash_number: e.target.value })}
              className="font-cairo text-sm text-center tracking-wider"
              placeholder="01xxxxxxxxx"
              dir="ltr"
            />
            <p className="text-xs font-cairo text-muted-foreground mt-2">
              سيظهر هذا الرقم للعملاء عند اختيار الدفع بفودافون كاش
            </p>
          </div>
        </div>

        {/* Daily Code */}
        <div className="bg-muted rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-cairo text-muted-foreground mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent" /> كود الدخول اليومي
          </p>
          <Input
            type="text"
            value={settings.daily_code}
            onChange={e => setSettings({ ...settings, daily_code: e.target.value })}
            className="font-cairo text-sm text-center tracking-widest font-bold text-lg"
            placeholder="مثال: 1234"
            dir="ltr"
          />
          <p className="text-xs font-cairo text-muted-foreground mt-2">
            العميل اللي يدخل الكود الصحيح يقدر يستخدم الموقع كامل. اللي مش عنده الكود يقدر يحجز مسبق بس.
          </p>
        </div>

        <Button variant="hero" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ الإعدادات
        </Button>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl p-4 sm:p-6 border border-border space-y-5">
        <h3 className="font-bold text-card-foreground font-cairo flex items-center gap-2 text-sm sm:text-base">
          <Lock className="w-5 h-5 text-accent" /> تغيير كلمة المرور
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-cairo text-muted-foreground mb-1 block">كلمة المرور الحالية</label>
            <div className="relative">
              <Input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="font-cairo text-sm pr-3 pl-10"
                placeholder="أدخل كلمة المرور الحالية"
              />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-cairo text-muted-foreground mb-1 block">كلمة المرور الجديدة</label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="font-cairo text-sm pr-3 pl-10"
                placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-cairo text-muted-foreground mb-1 block">تأكيد كلمة المرور الجديدة</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="font-cairo text-sm pr-3 pl-10"
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <Button variant="emerald" size="lg" className="w-full" onClick={handleChangePassword} disabled={changingPassword}>
          {changingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
          تغيير كلمة المرور
        </Button>
      </motion.div>
    </div>
  );
};

export default AdminSettings;