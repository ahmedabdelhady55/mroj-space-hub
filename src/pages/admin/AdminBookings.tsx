import { motion } from "framer-motion";
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";
import { getBookings } from "@/lib/bookingStore";

const AdminBookings = () => {
  const bookings = getBookings();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground font-cairo flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-accent" /> إدارة الحجوزات
      </h2>

      {bookings.length === 0 ? (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <p className="text-muted-foreground font-cairo">لا توجد حجوزات حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {b.status === "active" ? (
                    <Clock className="w-5 h-5 text-accent" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald" />
                  )}
                  <div>
                    <p className="font-bold text-card-foreground font-cairo">{b.id}</p>
                    <p className="text-xs text-muted-foreground font-cairo">{b.details}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-cairo ${
                  b.status === "active" ? "bg-accent/20 text-accent" : "bg-emerald/20 text-emerald"
                }`}>
                  {b.status === "active" ? "جارية" : "مكتملة"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center bg-muted rounded-lg p-3">
                <div>
                  <p className="text-xs text-muted-foreground font-cairo">المساحة/الغرفة</p>
                  <p className="font-bold text-card-foreground font-cairo text-sm">{b.areaCost} ج.م</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-cairo">الطلبات</p>
                  <p className="font-bold text-card-foreground font-cairo text-sm">{b.ordersCost} ج.م</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-cairo">الإجمالي</p>
                  <p className="font-bold text-gradient-gold font-cairo text-sm">{b.totalCost} ج.م</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
