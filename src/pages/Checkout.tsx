import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Receipt, Banknote, CheckCircle, ArrowRight, Star, Loader2, Smartphone, Copy, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usePoints, setUsePoints] = useState(false);
  const [loyaltySettings, setLoyaltySettings] = useState<any>(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    const { data: settingsData } = await supabase.from("loyalty_settings").select("*").limit(1).single();
    setLoyaltySettings(settingsData);

    const { data } = await supabase.from("bookings").select("*").eq("user_id", user.id).eq("status", "active")
      .order("created_at", { ascending: false }).limit(1);

    if (data && data.length > 0) {
      setActiveBooking(data[0]);
      const { data: ordersData } = await supabase.from("booking_orders").select("*").eq("booking_id", data[0].id);
      setOrders(ordersData || []);

      // Check if already submitted payment
      if (data[0].payment_status === "pending_confirmation") {
        setPaymentSubmitted(true);
        setSelectedMethod(data[0].payment_method);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Listen for admin confirmation in realtime
  useEffect(() => {
    if (!activeBooking) return;
    const channel = supabase
      .channel(`booking-${activeBooking.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${activeBooking.id}`,
      }, (payload) => {
        const updated = payload.new as any;
        if (updated.payment_status === 'confirmed' && updated.status === 'completed') {
          setActiveBooking(updated);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeBooking?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!activeBooking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-muted-foreground font-cairo text-lg mb-4">لا توجد جلسة نشطة</p>
          <Button variant="hero" onClick={() => navigate("/home")}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const isConfirmed = activeBooking.payment_status === "confirmed" && activeBooking.status === "completed";

  const userPoints = profile?.points || 0;
  const minRedeem = loyaltySettings?.min_redeem_points || 50;
  const pointValue = loyaltySettings?.point_value || 1;
  const canUsePoints = userPoints >= minRedeem;
  const pointsDiscount = usePoints && canUsePoints ? Math.min(userPoints * pointValue, activeBooking?.total_cost || 0) : 0;
  const pointsToDeduct = usePoints && canUsePoints ? Math.min(userPoints, Math.floor((activeBooking?.total_cost || 0) / pointValue)) : 0;
  const finalTotal = (activeBooking?.total_cost || 0) - pointsDiscount;

  const vodafoneNumber = loyaltySettings?.vodafone_cash_number || "";

  const handlePay = async (method: "cash" | "vodafone_cash") => {
    if (!activeBooking || !user) return;

    setSelectedMethod(method);

    // Update booking with payment method and set status to pending_confirmation
    await supabase.from("bookings").update({
      payment_method: method,
      payment_status: "pending_confirmation",
      total_cost: finalTotal,
    }).eq("id", activeBooking.id);

    setPaymentSubmitted(true);
    toast({
      title: method === "vodafone_cash" ? "تم إرسال طلب الدفع 📱" : "تم إرسال طلب الدفع 💵",
      description: "في انتظار تأكيد الإدارة",
    });
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(vodafoneNumber);
    toast({ title: "تم نسخ الرقم ✅" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-emerald px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-10">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="text-primary-foreground">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground font-cairo">
            {isConfirmed ? "تمت المغادرة" : "المغادرة والدفع"}
          </h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 -mt-4 pb-8">
        {isConfirmed ? (
          /* Payment Confirmed by Admin */
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-lg text-center">
            <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-emerald mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-card-foreground font-cairo mb-2">شكراً لزيارتك! 🎉</h2>
            <p className="text-muted-foreground font-cairo mb-2">تم تأكيد الدفع بنجاح</p>
            <div className="bg-emerald/10 border border-emerald/20 rounded-xl p-4 mb-6 space-y-2">
              <p className="text-emerald font-bold font-cairo">ربحت {activeBooking.points_earned} نقطة ولاء! ⭐</p>
              <p className="text-sm text-emerald font-cairo">الفاتورة: {activeBooking.total_cost} ج.م</p>
                <p className="text-xs text-emerald font-cairo">
                  طريقة الدفع: {activeBooking.payment_method === "vodafone_cash" ? "فودافون كاش" : "كاش"}
                </p>
            </div>
            <Button variant="hero" size="lg" className="w-full" onClick={() => navigate("/home")}>
              العودة للرئيسية
            </Button>
          </motion.div>
        ) : paymentSubmitted ? (
          /* Waiting for Admin Confirmation */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-lg text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-accent animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground font-cairo mb-2">في انتظار تأكيد الإدارة</h2>
            <p className="text-sm text-muted-foreground font-cairo mb-4">
              {selectedMethod === "vodafone_cash"
                ? "تم إرسال إشعار للإدارة بتحويلك عبر فودافون كاش"
                : "تم إرسال إشعار للإدارة لتأكيد الدفع الكاش"}
            </p>
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-4">
              <p className="font-bold font-cairo text-card-foreground text-sm">المبلغ: {finalTotal} ج.م</p>
              <p className="text-xs font-cairo text-muted-foreground mt-1">
                طريقة الدفع: {selectedMethod === "vodafone_cash" ? "فودافون كاش 📱" : "كاش 💵"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground font-cairo">
              سيتم تأكيد الدفع وإضافة نقاط الولاء بعد مراجعة الإدارة ✅
            </p>
          </motion.div>
        ) : (
          /* Invoice & Payment Options */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              <h2 className="text-lg sm:text-xl font-bold text-card-foreground font-cairo">ملخص الفاتورة</h2>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between font-cairo text-sm">
                <span className="text-muted-foreground">
                  {activeBooking.type === "public" ? `رسوم المساحة العامة (${activeBooking.person_count} فرد)` : `رسوم الغرفة (${activeBooking.room_name})`}
                </span>
                <span className="text-card-foreground font-bold">{activeBooking.area_cost} ج.م</span>
              </div>

              {orders.length > 0 && (
                <>
                  <div className="border-t border-border pt-2">
                    <p className="text-sm font-cairo text-muted-foreground mb-2">الطلبات:</p>
                    {orders.map((order: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs font-cairo text-muted-foreground py-1">
                        <span>{order.item_name} × {order.quantity}</span>
                        <span>{order.item_price * order.quantity} ج.م</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-cairo text-sm border-t border-border pt-2">
                    <span className="text-muted-foreground">إجمالي الطلبات</span>
                    <span className="text-card-foreground font-bold">{activeBooking.orders_cost} ج.م</span>
                  </div>
                </>
              )}

              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-card-foreground font-cairo text-sm">المجموع قبل الخصم</span>
                <span className="font-bold text-card-foreground font-cairo">{activeBooking.total_cost} ج.م</span>
              </div>
            </div>

            {/* Points Redemption Section */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 sm:p-4 mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  <span className="font-bold font-cairo text-card-foreground text-sm">نقاط الولاء</span>
                </div>
                <span className="text-sm font-cairo text-accent font-bold">{userPoints} نقطة</span>
              </div>

              {canUsePoints ? (
                <label className="flex items-center gap-3 cursor-pointer mt-2 p-2 rounded-lg bg-background/50">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="rounded border-border w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm font-cairo text-card-foreground">
                    استخدام {pointsToDeduct || userPoints} نقطة للحصول على خصم {pointsDiscount || Math.min(userPoints * pointValue, activeBooking.total_cost)} ج.م
                  </span>
                </label>
              ) : (
                <p className="text-xs font-cairo text-muted-foreground mt-1">
                  تحتاج {minRedeem} نقطة على الأقل لاستخدام النقاط (لديك {userPoints} نقطة)
                </p>
              )}
            </div>

            {/* Points discount line */}
            {usePoints && pointsDiscount > 0 && (
              <div className="flex justify-between font-cairo text-sm text-emerald-500 mb-3 px-1">
                <span>خصم النقاط ({pointsToDeduct} نقطة)</span>
                <span>- {pointsDiscount} ج.م</span>
              </div>
            )}

            {/* Final total */}
            <div className="border-t-2 border-accent/30 pt-3 flex justify-between mb-5">
              <span className="text-lg font-bold text-card-foreground font-cairo">الإجمالي</span>
              <span className="text-2xl font-bold text-gradient-gold font-cairo">{finalTotal} ج.م</span>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-cairo text-muted-foreground mb-2">طريقة الدفع:</p>
              <Button variant="hero" size="xl" className="w-full" onClick={() => handlePay("cash")}>
                <Banknote className="w-5 h-5" /> دفع كاش
              </Button>

              {vodafoneNumber && (
                <div className="space-y-2">
                  <Button variant="outline" size="lg" className="w-full font-cairo" onClick={() => handlePay("vodafone_cash")}>
                    <Smartphone className="w-5 h-5" /> دفع بفودافون كاش
                  </Button>
                  <div className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-xs font-cairo text-muted-foreground mb-1">حوّل المبلغ على الرقم:</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold font-cairo text-card-foreground text-lg tracking-wider" dir="ltr">{vodafoneNumber}</span>
                      <button onClick={copyNumber} className="text-accent hover:text-accent/80">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
