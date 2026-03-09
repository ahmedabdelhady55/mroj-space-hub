import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Star, History, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      // Get all profiles
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (!profiles) return;

      // Get booking counts and totals per user
      const enriched = await Promise.all(profiles.map(async (p: any) => {
        const { data: bookings } = await supabase.from("bookings").select("total_cost, status")
          .eq("user_id", p.id).eq("status", "completed");
        return {
          ...p,
          bookingsCount: bookings?.length || 0,
          totalSpent: bookings?.reduce((sum: number, b: any) => sum + Number(b.total_cost), 0) || 0,
        };
      }));
      setCustomers(enriched);
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c: any) =>
    c.name.includes(search) || c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-cairo">العملاء</h2>
        <span className="text-sm text-muted-foreground font-cairo">{customers.length} عميل</span>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)}
          className="pr-10 font-cairo" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-cairo">لا يوجد عملاء بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((customer: any, i: number) => (
            <motion.div key={customer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                    <span className="font-bold text-emerald-dark font-cairo">{customer.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-card-foreground font-cairo">{customer.name}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">{customer.phone}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted rounded-lg p-2">
                  <Star className="w-4 h-4 text-accent mx-auto mb-1" />
                  <p className="text-sm font-bold text-card-foreground font-cairo">{customer.points}</p>
                  <p className="text-xs text-muted-foreground font-cairo">نقاط</p>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <History className="w-4 h-4 text-accent mx-auto mb-1" />
                  <p className="text-sm font-bold text-card-foreground font-cairo">{customer.bookingsCount}</p>
                  <p className="text-xs text-muted-foreground font-cairo">حجوزات</p>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <p className="text-sm font-bold text-card-foreground font-cairo">{customer.totalSpent}</p>
                  <p className="text-xs text-muted-foreground font-cairo">ج.م مصروف</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
