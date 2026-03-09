import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DoorOpen, ClipboardList, Users, TrendingUp, Search, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ rooms: "0/0", bookingsCount: 0, customers: 0, revenue: 0 });
  const [dateFilter, setDateFilter] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  const getDateRange = () => {
    const now = new Date();
    let fromDate: string | null = null;
    let toDate: string | null = null;

    if (dateFilter === "today") {
      fromDate = now.toISOString().split("T")[0];
    } else if (dateFilter === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      fromDate = d.toISOString().split("T")[0];
    } else if (dateFilter === "month") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      fromDate = d.toISOString().split("T")[0];
    } else if (dateFilter === "custom") {
      fromDate = customFrom || null;
      if (customTo) {
        const toEnd = new Date(customTo);
        toEnd.setDate(toEnd.getDate() + 1);
        toDate = toEnd.toISOString().split("T")[0];
      }
    }
    return { fromDate, toDate };
  };

  useEffect(() => {
    const fetchStats = async () => {
      const { fromDate, toDate } = getDateRange();

      const { data: rooms } = await supabase.from("rooms").select("available");
      const occupied = rooms?.filter((r: any) => !r.available).length || 0;
      const total = rooms?.length || 0;

      let bookingsQuery = supabase.from("bookings").select("total_cost, created_at, status, type, room_name, user_id");
      if (fromDate) bookingsQuery = bookingsQuery.gte("created_at", fromDate);
      if (toDate) bookingsQuery = bookingsQuery.lt("created_at", toDate);

      const { data: bookings } = await bookingsQuery.order("created_at", { ascending: false });

      const { data: profiles } = await supabase.from("profiles").select("id");

      // Get profile names for recent bookings
      const userIds = [...new Set(bookings?.map((b) => b.user_id) || [])];
      const { data: bookingProfiles } = await supabase.from("profiles").select("id, name, phone").in("id", userIds);

      const enrichedBookings = (bookings || []).slice(0, 10).map((b) => ({
        ...b,
        profile: bookingProfiles?.find((p) => p.id === b.user_id),
      }));

      setRecentBookings(enrichedBookings);
      setStats({
        rooms: `${occupied}/${total}`,
        bookingsCount: bookings?.length || 0,
        customers: profiles?.length || 0,
        revenue: bookings?.reduce((sum: number, b: any) => sum + Number(b.total_cost), 0) || 0,
      });
    };
    fetchStats();
  }, [dateFilter, customFrom, customTo]);

  const periodLabel = dateFilter === "today" ? "اليوم" : dateFilter === "week" ? "الأسبوع" : dateFilter === "month" ? "الشهر" : "مخصص";

  const statItems = [
    { title: "غرف مشغولة", value: stats.rooms, icon: DoorOpen, color: "text-accent" },
    { title: `حجوزات ${periodLabel}`, value: stats.bookingsCount.toString(), icon: ClipboardList, color: "text-emerald-500" },
    { title: "إجمالي العملاء", value: stats.customers.toString(), icon: Users, color: "text-accent" },
    { title: `إيرادات ${periodLabel}`, value: `${stats.revenue} ج.م`, icon: TrendingUp, color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-sm font-cairo text-muted-foreground">الفترة:</span>
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[160px] font-cairo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today" className="font-cairo">اليوم</SelectItem>
              <SelectItem value="week" className="font-cairo">آخر أسبوع</SelectItem>
              <SelectItem value="month" className="font-cairo">آخر شهر</SelectItem>
              <SelectItem value="all" className="font-cairo">كل الفترات</SelectItem>
              <SelectItem value="custom" className="font-cairo">تاريخ مخصص</SelectItem>
            </SelectContent>
          </Select>
          {dateFilter === "custom" && (
            <>
              <div>
                <label className="text-xs text-muted-foreground font-cairo mb-1 block">من</label>
                <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-[150px]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-cairo mb-1 block">إلى</label>
                <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-[150px]" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, i) => (
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

      {/* Recent Bookings */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-card-foreground font-cairo flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-accent" /> آخر الحجوزات
          </h3>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground font-cairo text-sm">لا توجد حجوزات في هذه الفترة</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentBookings.map((b) => (
              <div key={b.created_at + b.user_id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-cairo font-medium text-card-foreground text-sm">{b.profile?.name || "عميل"}</p>
                  <p className="text-xs text-muted-foreground font-cairo">
                    {b.type === "room" ? `غرفة: ${b.room_name}` : "منطقة عامة"} •{" "}
                    {new Date(b.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-accent font-cairo text-sm">{b.total_cost} ج.م</p>
                  <span className={`text-xs font-cairo ${b.status === "active" ? "text-yellow-500" : "text-emerald-500"}`}>
                    {b.status === "active" ? "جارية" : "مكتملة"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
