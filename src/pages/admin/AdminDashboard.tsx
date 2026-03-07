import { motion } from "framer-motion";
import { DoorOpen, ClipboardList, Users, TrendingUp, Clock, AlertTriangle } from "lucide-react";

const stats = [
  { title: "غرف مشغولة", value: "2/3", icon: DoorOpen, color: "text-accent" },
  { title: "حجوزات اليوم", value: "12", icon: ClipboardList, color: "text-emerald" },
  { title: "عملاء اليوم", value: "28", icon: Users, color: "text-accent" },
  { title: "إيرادات اليوم", value: "3,450 ج.م", icon: TrendingUp, color: "text-emerald" },
];

const alerts = [
  { text: "غرفة النخيل: ينتهي الحجز خلال 15 دقيقة", type: "warning" },
  { text: "طلب جديد من غرفة الياسمين (2 أصناف)", type: "info" },
  { text: "عميل جديد سجّل الآن: أحمد محمد", type: "info" },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-sm text-muted-foreground font-cairo">{stat.title}</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground font-cairo">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-card rounded-xl p-6 border border-border">
        <h2 className="font-bold text-card-foreground font-cairo mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-accent" /> التنبيهات
        </h2>
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
              alert.type === "warning" ? "bg-accent/10 border border-accent/20" : "bg-muted"
            }`}>
              {alert.type === "warning" ? (
                <Clock className="w-4 h-4 text-accent flex-shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-emerald flex-shrink-0" />
              )}
              <p className="text-sm font-cairo text-card-foreground">{alert.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card rounded-xl p-6 border border-border">
        <h2 className="font-bold text-card-foreground font-cairo mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {["إضافة حجز يدوي", "تعديل حالة غرفة", "إضافة صنف جديد", "تقرير الإيرادات"].map((action) => (
            <button key={action}
              className="p-4 rounded-xl bg-muted hover:bg-accent/10 border border-border hover:border-accent transition-all text-sm font-cairo text-card-foreground">
              {action}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
