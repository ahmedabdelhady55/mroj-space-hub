import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Receipt, CreditCard, Banknote, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getActiveBooking, completeActiveBooking } from "@/lib/bookingStore";

const Checkout = () => {
  const [paid, setPaid] = useState(false);
  const [finalBooking, setFinalBooking] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const activeBooking = getActiveBooking();

  if (!activeBooking && !paid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-muted-foreground font-cairo text-lg mb-4">لا توجد جلسة نشطة</p>
          <Button variant="hero" onClick={() => navigate("/home")}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const handlePay = () => {
    const completed = completeActiveBooking();
    setFinalBooking(completed);
    setPaid(true);
    toast({ title: "تم الدفع بنجاح ✅", description: `شكراً لزيارتك! ربحت ${completed?.pointsEarned} نقطة` });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-emerald px-6 pt-8 pb-10">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="text-primary-foreground">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground font-cairo">
            {paid ? "تمت المغادرة" : "المغادرة والدفع"}
          </h1>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {!paid ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Receipt className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold text-card-foreground font-cairo">ملخص الفاتورة</h2>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between font-cairo text-sm">
                <span className="text-muted-foreground">
                  {activeBooking!.type === "public" ? `رسوم المساحة العامة (${activeBooking!.personCount} فرد)` : `رسوم الغرفة (${activeBooking!.roomName})`}
                </span>
                <span className="text-card-foreground font-bold">{activeBooking!.areaCost} ج.م</span>
              </div>

              {activeBooking!.orders.length > 0 && (
                <>
                  <div className="border-t border-border pt-2">
                    <p className="text-sm font-cairo text-muted-foreground mb-2">الطلبات:</p>
                    {activeBooking!.orders.map((order, i) => (
                      <div key={i} className="flex justify-between text-xs font-cairo text-muted-foreground py-1">
                        <span>{order.name} × {order.quantity}</span>
                        <span>{order.price * order.quantity} ج.م</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-cairo text-sm border-t border-border pt-2">
                    <span className="text-muted-foreground">إجمالي الطلبات</span>
                    <span className="text-card-foreground font-bold">{activeBooking!.ordersCost} ج.م</span>
                  </div>
                </>
              )}

              <div className="border-t-2 border-accent/30 pt-3 flex justify-between">
                <span className="text-lg font-bold text-card-foreground font-cairo">الإجمالي</span>
                <span className="text-2xl font-bold text-gradient-gold font-cairo">{activeBooking!.totalCost} ج.م</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-cairo text-muted-foreground mb-2">طريقة الدفع:</p>
              <Button variant="hero" size="xl" className="w-full" onClick={handlePay}>
                <Banknote className="w-5 h-5" /> دفع كاش
              </Button>
              <Button variant="outline" size="lg" className="w-full font-cairo" onClick={handlePay}>
                <CreditCard className="w-5 h-5" /> دفع بالبطاقة
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 border border-border shadow-lg text-center">
            <CheckCircle className="w-20 h-20 text-emerald mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-card-foreground font-cairo mb-2">شكراً لزيارتك! 🎉</h2>
            <p className="text-muted-foreground font-cairo mb-2">تم الدفع بنجاح</p>
            {finalBooking && (
              <div className="bg-emerald/10 border border-emerald/20 rounded-xl p-4 mb-6 space-y-2">
                <p className="text-emerald font-bold font-cairo">ربحت {finalBooking.pointsEarned} نقطة ولاء! ⭐</p>
                <p className="text-sm text-emerald font-cairo">الفاتورة: {finalBooking.totalCost} ج.م</p>
              </div>
            )}
            <Button variant="hero" size="lg" className="w-full" onClick={() => navigate("/home")}>
              العودة للرئيسية
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
