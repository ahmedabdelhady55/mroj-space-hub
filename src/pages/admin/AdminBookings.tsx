import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Clock, CheckCircle, ChevronDown, ChevronUp, Package, Loader2, CreditCard, Banknote, Smartphone, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type BookingOrder = {
  id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  status: string;
};

type Booking = {
  id: string;
  type: string;
  room_name: string | null;
  status: string;
  details: string;
  created_at: string;
  area_cost: number;
  orders_cost: number;
  total_cost: number;
  person_count: number | null;
  user_id: string;
  points_earned: number;
  payment_method?: string;
  payment_status?: string;
  profile?: { name: string; phone: string; points: number };
  orders?: BookingOrder[];
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loyaltySettings, setLoyaltySettings] = useState<any>(null);
  const { toast } = useToast();

  const fetchBookings = async () => {
    // Fetch loyalty settings
    const { data: settingsData } = await supabase.from("loyalty_settings").select("*").limit(1).single();
    setLoyaltySettings(settingsData);

    let query = supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    const now = new Date();
    let fromDate: string | null = null;
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
    } else if (dateFilter === "custom" && customFrom) {
      fromDate = customFrom;
    }

    if (fromDate) query = query.gte("created_at", fromDate);
    if (dateFilter === "custom" && customTo) {
      const toEnd = new Date(customTo);
      toEnd.setDate(toEnd.getDate() + 1);
      query = query.lt("created_at", toEnd.toISOString().split("T")[0]);
    }

    if (filterStatus !== "all") {
      if (filterStatus === "pending_payment") {
        query = query.eq("payment_status", "pending_confirmation");
      } else {
        query = query.eq("status", filterStatus);
      }
    }

    const { data: bookingsData } = await query;
    if (!bookingsData) return;

    const userIds = [...new Set(bookingsData.map((b) => b.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, phone, points")
      .in("id", userIds);

    const bookingIds = bookingsData.map((b) => b.id);
    const { data: orders } = await supabase
      .from("booking_orders")
      .select("*")
      .in("booking_id", bookingIds);

    const enriched = bookingsData.map((b) => ({
      ...b,
      profile: profiles?.find((p) => p.id === b.user_id),
      orders: orders?.filter((o) => o.booking_id === b.id) || [],
    }));

    setBookings(enriched as Booking[]);
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus, dateFilter, customFrom, customTo]);

  // Realtime for new payment requests
  useEffect(() => {
    const channel = supabase
      .channel('admin-bookings')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
      }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    await supabase
      .from("booking_orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    await fetchBookings();
    setUpdatingOrder(null);
  };

  const confirmPayment = async (booking: Booking) => {
    setConfirmingPayment(booking.id);

    const settings = loyaltySettings || { points_per_amount: 10, amount_for_points: 100 };
    const earned = Math.floor(booking.total_cost / Number(settings.amount_for_points)) * Number(settings.points_per_amount);

    // Complete booking and confirm payment
    await supabase.from("bookings").update({
      status: "completed",
      payment_status: "confirmed",
      points_earned: earned,
    }).eq("id", booking.id);

    // Update user points
    const currentPoints = booking.profile?.points || 0;
    const newPoints = currentPoints + earned;
    await supabase.from("profiles").update({ points: Math.max(0, newPoints) }).eq("id", booking.user_id);

    await fetchBookings();
    setConfirmingPayment(null);
    toast({
      title: "تم تأكيد الدفع ✅",
      description: `تم إضافة ${earned} نقطة ولاء للعميل ${booking.profile?.name || ""}`,
    });
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.profile?.name?.toLowerCase().includes(q) ||
      b.profile?.phone?.includes(q) ||
      b.room_name?.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    );
  });

  const pendingPaymentsCount = bookings.filter(b => b.payment_status === "pending_confirmation").length;

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 font-cairo text-xs">قيد الانتظار</Badge>;
      case "preparing":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 font-cairo text-xs">جاري التحضير</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-cairo text-xs">تم التسليم</Badge>;
      default:
        return <Badge variant="outline" className="font-cairo text-xs">{status}</Badge>;
    }
  };

  const getPaymentBadge = (booking: Booking) => {
    const ps = booking.payment_status;
    const pm = booking.payment_method;
    if (ps === "pending_confirmation") {
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30 font-cairo text-xs">
          {pm === "vodafone_cash" ? "📱 فودافون كاش - بانتظار التأكيد" : "💵 كاش - بانتظار التأكيد"}
        </Badge>
      );
    }
    if (ps === "confirmed") {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-cairo text-xs">
          {pm === "vodafone_cash" ? "📱 فودافون كاش ✅" : "💵 كاش ✅"}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground font-cairo flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-accent" /> إدارة الحجوزات والطلبات
        </h2>
        {pendingPaymentsCount > 0 && (
          <Badge className="bg-orange-500 text-white font-cairo animate-pulse">
            {pendingPaymentsCount} طلب دفع بانتظار التأكيد
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-muted-foreground font-cairo mb-1 block">بحث</label>
            <Input
              placeholder="اسم العميل، الهاتف، الغرفة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-cairo"
            />
          </div>
          <div className="min-w-[140px]">
            <label className="text-xs text-muted-foreground font-cairo mb-1 block">حالة الحجز</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="font-cairo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-cairo">الكل</SelectItem>
                <SelectItem value="active" className="font-cairo">جارية</SelectItem>
                <SelectItem value="completed" className="font-cairo">مكتملة</SelectItem>
                <SelectItem value="pending_payment" className="font-cairo">بانتظار تأكيد الدفع</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[140px]">
            <label className="text-xs text-muted-foreground font-cairo mb-1 block">الفترة</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="font-cairo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today" className="font-cairo">اليوم</SelectItem>
                <SelectItem value="week" className="font-cairo">آخر أسبوع</SelectItem>
                <SelectItem value="month" className="font-cairo">آخر شهر</SelectItem>
                <SelectItem value="all" className="font-cairo">الكل</SelectItem>
                <SelectItem value="custom" className="font-cairo">تاريخ مخصص</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        <p className="text-xs text-muted-foreground font-cairo">عدد النتائج: {filteredBookings.length}</p>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <p className="text-muted-foreground font-cairo">لا توجد حجوزات في هذه الفترة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const isPendingPayment = b.payment_status === "pending_confirmation";
            return (
              <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`bg-card rounded-xl border overflow-hidden ${isPendingPayment ? "border-orange-500/50 ring-1 ring-orange-500/20" : "border-border"}`}>
                {/* Booking Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {b.status === "active" ? (
                        <Clock className="w-5 h-5 text-accent" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                      <div>
                        <p className="font-bold text-card-foreground font-cairo">
                          {b.profile?.name || "عميل"}
                        </p>
                        <p className="text-xs text-muted-foreground font-cairo">
                          {b.profile?.phone} • {b.type === "room" ? `غرفة: ${b.room_name}` : "منطقة عامة"}
                          {b.person_count ? ` • ${b.person_count} أشخاص` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {getPaymentBadge(b)}
                      <span className={`px-3 py-1 rounded-full text-xs font-cairo ${
                        b.status === "active" ? "bg-accent/20 text-accent" : "bg-emerald-500/20 text-emerald-500"
                      }`}>
                        {b.status === "active" ? "جارية" : "مكتملة"}
                      </span>
                      {expandedId === b.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-cairo">
                      {new Date(b.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="font-bold text-accent font-cairo">{b.total_cost} ج.م</p>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === b.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-border"
                  >
                    {/* Payment Confirmation Banner */}
                    {isPendingPayment && (
                      <div className="bg-orange-500/10 border-b border-orange-500/20 p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-bold font-cairo text-card-foreground text-sm flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-orange-500" />
                              طلب دفع بانتظار التأكيد
                            </p>
                            <p className="text-xs font-cairo text-muted-foreground mt-1">
                              طريقة الدفع: {b.payment_method === "vodafone_cash" ? "فودافون كاش 📱" : "كاش 💵"}
                              {" • "}المبلغ: {b.total_cost} ج.م
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-cairo gap-2"
                            onClick={(e) => { e.stopPropagation(); confirmPayment(b); }}
                            disabled={confirmingPayment === b.id}
                          >
                            {confirmingPayment === b.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-4 h-4" />
                            )}
                            تأكيد الدفع
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Cost Breakdown */}
                    <div className="grid grid-cols-3 gap-4 text-center bg-muted/50 p-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-cairo">المساحة/الغرفة</p>
                        <p className="font-bold text-card-foreground font-cairo text-sm">{b.area_cost} ج.م</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-cairo">الطلبات</p>
                        <p className="font-bold text-card-foreground font-cairo text-sm">{b.orders_cost} ج.م</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-cairo">الإجمالي</p>
                        <p className="font-bold text-accent font-cairo text-sm">{b.total_cost} ج.م</p>
                      </div>
                    </div>

                    {/* Orders List */}
                    <div className="p-4">
                      <h4 className="font-bold text-card-foreground font-cairo text-sm mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-accent" /> الطلبات ({b.orders?.length || 0})
                      </h4>
                      {(!b.orders || b.orders.length === 0) ? (
                        <p className="text-xs text-muted-foreground font-cairo text-center py-4">لا توجد طلبات لهذا الحجز</p>
                      ) : (
                        <div className="space-y-2">
                          {b.orders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div>
                                  <p className="font-cairo text-sm font-medium text-card-foreground">{order.item_name}</p>
                                  <p className="text-xs text-muted-foreground font-cairo">
                                    {order.quantity}x • {order.item_price} ج.م
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getOrderStatusBadge(order.status)}
                                <Select
                                  value={order.status}
                                  onValueChange={(val) => updateOrderStatus(order.id, val)}
                                  disabled={updatingOrder === order.id}
                                >
                                  <SelectTrigger className="w-[130px] h-8 text-xs font-cairo">
                                    {updatingOrder === order.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <SelectValue />
                                    )}
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending" className="font-cairo text-xs">قيد الانتظار</SelectItem>
                                    <SelectItem value="preparing" className="font-cairo text-xs">جاري التحضير</SelectItem>
                                    <SelectItem value="delivered" className="font-cairo text-xs">تم التسليم</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
