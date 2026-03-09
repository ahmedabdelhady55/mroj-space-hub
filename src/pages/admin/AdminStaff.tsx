import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Trash2, Edit, Search, Loader2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StaffMember {
  user_id: string;
  name: string;
  phone: string;
  role_label: string;
  permissions: string[];
  active: boolean;
}

const allPermissions = [
  { id: "bookings_view", label: "عرض الحجوزات" },
  { id: "bookings_manage", label: "إدارة الحجوزات" },
  { id: "rooms_view", label: "عرض الغرف" },
  { id: "rooms_manage", label: "إدارة الغرف" },
  { id: "menu_view", label: "عرض القائمة" },
  { id: "menu_manage", label: "إدارة القائمة" },
  { id: "orders_view", label: "عرض الطلبات" },
  { id: "orders_manage", label: "إدارة الطلبات" },
  { id: "customers_view", label: "عرض العملاء" },
  { id: "customers_manage", label: "إدارة العملاء" },
  { id: "staff_manage", label: "إدارة الموظفين" },
  { id: "settings_manage", label: "إعدادات الموقع" },
  { id: "reports_view", label: "التقارير" },
];

const rolePresets: Record<string, string[]> = {
  admin: allPermissions.map((p) => p.id),
  receptionist: ["bookings_view", "bookings_manage", "rooms_view", "rooms_manage", "customers_view"],
  kitchen: ["orders_view", "orders_manage", "menu_view"],
  cashier: ["bookings_view", "orders_view", "customers_view", "reports_view"],
};

const roleLabels: Record<string, string> = {
  admin: "مدير",
  receptionist: "موظف استقبال",
  kitchen: "مطبخ",
  cashier: "كاشير",
  custom: "مخصص",
};

const AdminStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", password: "", role: "receptionist", permissions: [] as string[] });
  const { toast } = useToast();

  const fetchStaff = async () => {
    setLoading(true);
    // Get all staff_permissions entries with profile data
    const { data: staffPerms } = await supabase
      .from("staff_permissions")
      .select("*");

    if (staffPerms && staffPerms.length > 0) {
      // Get profiles for these users
      const userIds = staffPerms.map((s: any) => s.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      const merged: StaffMember[] = staffPerms.map((sp: any) => {
        const profile = profiles?.find((p: any) => p.id === sp.user_id);
        return {
          user_id: sp.user_id,
          name: profile?.name || "",
          phone: profile?.phone || "",
          role_label: sp.role_label,
          permissions: Array.isArray(sp.permissions) ? sp.permissions : [],
          active: sp.active,
        };
      });
      setStaff(merged);
    } else {
      setStaff([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filtered = staff.filter((s) =>
    s.name.includes(search) || s.phone.includes(search) || roleLabels[s.role_label]?.includes(search)
  );

  const handleRoleChange = (role: string) => {
    setForm((prev) => ({
      ...prev,
      role,
      permissions: rolePresets[role] || prev.permissions,
    }));
  };

  const togglePermission = (permId: string) => {
    setForm((prev) => ({
      ...prev,
      role: "custom",
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      toast({ title: "يرجى إدخال الاسم ورقم الهاتف", variant: "destructive" });
      return;
    }
    if (!editingId && !form.password) {
      toast({ title: "يرجى إدخال كلمة المرور", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (editingId) {
        const res = await supabase.functions.invoke("manage-staff", {
          body: {
            action: "update",
            user_id: editingId,
            name: form.name,
            phone: form.phone,
            password: form.password || undefined,
            permissions: form.permissions,
            role_label: form.role,
            active: true,
          },
        });
        if (res.data?.error) throw new Error(res.data.error);
        toast({ title: "تم تحديث الموظف ✅" });
      } else {
        const res = await supabase.functions.invoke("manage-staff", {
          body: {
            action: "create",
            name: form.name,
            phone: form.phone,
            password: form.password,
            permissions: form.permissions,
            role_label: form.role,
          },
        });
        if (res.data?.error) throw new Error(res.data.error);
        toast({ title: "تم إضافة الموظف ✅" });
      }
      await fetchStaff();
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", phone: "", password: "", role: "receptionist", permissions: rolePresets.receptionist });
    } catch (err: any) {
      toast({ title: "خطأ: " + err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleEdit = (s: StaffMember) => {
    setEditingId(s.user_id);
    setForm({ name: s.name, phone: s.phone, password: "", role: s.role_label, permissions: s.permissions });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;
    try {
      const res = await supabase.functions.invoke("manage-staff", {
        body: { action: "delete", user_id: userId },
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "تم حذف الموظف" });
      await fetchStaff();
    } catch (err: any) {
      toast({ title: "خطأ: " + err.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (s: StaffMember) => {
    try {
      const res = await supabase.functions.invoke("manage-staff", {
        body: {
          action: "update",
          user_id: s.user_id,
          name: s.name,
          phone: s.phone,
          permissions: s.permissions,
          role_label: s.role_label,
          active: !s.active,
        },
      });
      if (res.data?.error) throw new Error(res.data.error);
      await fetchStaff();
    } catch (err: any) {
      toast({ title: "خطأ: " + err.message, variant: "destructive" });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground font-cairo flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" /> إدارة الموظفين والصلاحيات
        </h2>
        <Button variant="hero" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", phone: "", password: "", role: "receptionist", permissions: rolePresets.receptionist }); }}>
          <Plus className="w-4 h-4" /> إضافة موظف
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو رقم الهاتف أو الدور..." className="pr-10 font-cairo" />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border shadow-lg">
          <h3 className="font-bold text-card-foreground font-cairo mb-4">
            {editingId ? "تعديل موظف" : "إضافة موظف جديد"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-cairo text-muted-foreground mb-1">الاسم</label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="font-cairo" placeholder="الاسم الثلاثي" />
            </div>
            <div>
              <label className="block text-sm font-cairo text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> رقم الهاتف
              </label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="font-cairo" placeholder="01xxxxxxxxx" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-cairo text-muted-foreground mb-1">
                كلمة المرور {editingId && "(اتركها فارغة لعدم التغيير)"}
              </label>
              <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="font-cairo" placeholder={editingId ? "••••••" : "كلمة المرور"} />
            </div>
            <div>
              <label className="block text-sm font-cairo text-muted-foreground mb-1">الدور</label>
              <select value={form.role} onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 font-cairo text-sm">
                <option value="admin">مدير</option>
                <option value="receptionist">موظف استقبال</option>
                <option value="kitchen">مطبخ</option>
                <option value="cashier">كاشير</option>
                <option value="custom">مخصص</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-cairo mb-2">
            💡 الموظف يقدر يسجل دخول من الصفحة الرئيسية برقم الهاتف وكلمة المرور
          </p>

          {/* Permissions */}
          <div className="mb-4">
            <label className="block text-sm font-cairo text-muted-foreground mb-2">الصلاحيات</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allPermissions.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-accent/10 cursor-pointer transition-colors">
                  <input type="checkbox" checked={form.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)}
                    className="rounded border-border" />
                  <span className="text-xs font-cairo text-card-foreground">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="hero" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editingId ? "حفظ التعديلات" : "إضافة"}
            </Button>
            <Button variant="outline" className="font-cairo" onClick={() => { setShowForm(false); setEditingId(null); }}>إلغاء</Button>
          </div>
        </motion.div>
      )}

      {/* Staff List */}
      {staff.length === 0 && !showForm && (
        <div className="text-center py-16 text-muted-foreground font-cairo">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا يوجد موظفين حالياً</p>
          <p className="text-sm mt-1">اضغط على "إضافة موظف" لإضافة أول موظف</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((s) => (
          <motion.div key={s.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`bg-card rounded-xl p-5 border border-border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${!s.active ? "opacity-50" : ""}`}>
            <div className="w-12 h-12 rounded-full gradient-emerald flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary-foreground font-cairo">{s.name?.[0] || "?"}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-card-foreground font-cairo">{s.name}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-cairo">{roleLabels[s.role_label] || s.role_label}</span>
                {!s.active && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-cairo">معطل</span>}
              </div>
              <p className="text-xs text-muted-foreground font-cairo flex items-center gap-1">
                <Phone className="w-3 h-3" /> {s.phone}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {s.permissions.slice(0, 4).map((p) => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-cairo">
                    {allPermissions.find((ap) => ap.id === p)?.label}
                  </span>
                ))}
                {s.permissions.length > 4 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-cairo">
                    +{s.permissions.length - 4} أخرى
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleToggleActive(s)} title={s.active ? "تعطيل" : "تفعيل"}>
                <div className={`w-3 h-3 rounded-full ${s.active ? "bg-emerald-500" : "bg-destructive"}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                <Edit className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(s.user_id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminStaff;
