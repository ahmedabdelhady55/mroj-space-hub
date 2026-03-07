import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Coffee, StopCircle, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getActiveBooking, setActiveBooking, completeActiveBooking } from "@/lib/bookingStore";

const ActiveSession = () => {
  const [seconds, setSeconds] = useState(0);
  const [ended, setEnded] = useState(false);
  const [finalBooking, setFinalBooking] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const room = (location.state as any)?.room;

  const pricePerHour = room?.pricePerHour || 90;
  const currentCost = Math.ceil((seconds / 3600) * pricePerHour);

  const activeBooking = getActiveBooking();
  const ordersCost = activeBooking?.ordersCost || 0;
  const grandTotal = currentCost + ordersCost;

  useEffect(() => {
    if (ended) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [ended]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const handleEnd = () => {
    setEnded(true);
    // Update active booking with room cost
    if (activeBooking) {
      activeBooking.areaCost = currentCost;
      activeBooking.totalCost = currentCost + activeBooking.ordersCost;
      activeBooking.durationSeconds = seconds;
      setActiveBooking(activeBooking);
      const completed = completeActiveBooking();
      setFinalBooking(completed);
      toast({ title: t("session.end"), description: `الإجمالي: ${completed?.totalCost} ج.م` });
    } else {
      toast({ title: t("session.end"), description: `التكلفة: ${currentCost} ج.م` });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="gradient-emerald px-6 pt-8 pb-12 text-center">
        <h1 className="text-2xl font-bold text-primary-foreground font-cairo mb-1">
          {room?.name || t("session.title")}
        </h1>
        <p className="text-primary-foreground/70 font-cairo">
          {ended ? "انتهت الجلسة" : "الجلسة جارية..."}
        </p>
      </div>

      <div className="flex-1 px-6 -mt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-8 border border-border shadow-xl text-center">
          <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6 animate-pulse-gold">
            <Clock className="w-10 h-10 text-emerald-dark" />
          </div>

          <p className="text-muted-foreground font-cairo text-sm mb-2">{t("session.elapsed")}</p>
          <p className="text-5xl font-bold text-card-foreground font-cairo tracking-wider mb-6" dir="ltr">
            {formatTime(seconds)}
          </p>

          {/* Cost breakdown */}
          <div className="bg-muted rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm font-cairo">
              <span className="text-muted-foreground">تكلفة الغرفة</span>
              <span className="text-card-foreground font-bold">{currentCost} ج.م</span>
            </div>
            {ordersCost > 0 && (
              <div className="flex justify-between text-sm font-cairo">
                <span className="text-muted-foreground">طلبات الطعام</span>
                <span className="text-card-foreground font-bold">{ordersCost} ج.م</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-card-foreground font-bold font-cairo">الإجمالي</span>
              <span className="text-xl font-bold text-gradient-gold font-cairo">{grandTotal} ج.م</span>
            </div>
          </div>

          {!ended ? (
            <div className="space-y-3">
              <Button variant="hero" size="xl" className="w-full" onClick={() => navigate("/menu")}>
                <Coffee className="w-5 h-5" /> {t("session.order")}
              </Button>
              <Button variant="destructive" size="lg" className="w-full font-cairo" onClick={handleEnd}>
                <StopCircle className="w-5 h-5" /> {t("session.end")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {finalBooking && (
                <div className="bg-emerald/10 border border-emerald/20 rounded-xl p-4 space-y-2">
                  <p className="text-emerald font-bold font-cairo">🎉 ربحت {finalBooking.pointsEarned} نقطة ولاء!</p>
                  <div className="flex items-center justify-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald" />
                    <span className="text-sm font-cairo text-emerald">الفاتورة النهائية: {finalBooking.totalCost} ج.م</span>
                  </div>
                </div>
              )}
              <Button variant="hero" size="lg" className="w-full" onClick={() => navigate("/home")}>
                العودة للرئيسية
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ActiveSession;
