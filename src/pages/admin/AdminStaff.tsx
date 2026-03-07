import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Trash2, Edit, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Staff {
  id: string;
  name: string;
  username: string;
  role: string;
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

const initialStaff: Staff[] = [
  { id: "1", name: "أحمد محمد", username: "ahmed", role: "admin", permissions: rolePresets.admin, active: true },
  { id: "2", name: "سارة علي", username: "sara", role: "receptionist", permissions: rolePresets.receptionist, active: true },
  { id: "3", name: "محمود حسن", username: "mahmoud", role: "kitchen", permissions: rolePresets.kitchen, active: true },
];

const roleLabels: Record<string, string> = {
  admin: "مدير",
  receptionist: "موظف استقبال",
  kitchen: "مطبخ",
  cashier: "كاشير",
  custom: "مخصص",
};

const AdminStaff = () => {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "receptionist", permissions: [] as string[] });
  const { toast } = useToast();

  const filtered = staff.filter((s) =>
    s.name.includes(search) || s.username.includes(search) || roleLabels[s.role]?.includes(search)
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

  const handleSave = () => {
    if (!form.name || !form.username) return;
    if (editingId) {
      setStaff((prev) => prev.map((s) => s.id === editingId
        ? { ...s, name: form.name, username: form.username, role: form.role, permissions: form.permissions }
        : s));
      toast({ title: "تم تحديث الموظف ✅" });
    } else {
      setStaff((prev) => [...prev, {
        id: Date.now().toString(),
        name: form.name,
        username: form.username,
        role: form.role,
        permissions: form.permissions,
        active: true,
      }]);
      toast({ title: "تم إضافة الموظف ✅" });
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", username: "", password: "", role: "receptionist", permissions: [] });
  };

  const handleEdit = (s: Staff) => {
    setEditingId(s.id);
    setForm({ name: s.name, username: s.username, password: "", role: s.role, permissions: s.permissions });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "تم حذف الموظف" });
  };

  const handleToggleActive = (id: string) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground font-cairo flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" /> إدارة الموظفين والصلاحيات
        </h2>
        <Button variant="hero" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", username: "", password: "", role: "receptionist", permissions: rolePresets.receptionist }); }}>
          <Plus className="w-4 h-4" /> إضافة موظف
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الدور..." className="pr-10 font-cairo" />
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
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="font-cairo" />
            </div>
            <div>
              <label className="block text-sm font-cairo text-muted-foreground mb-1">اسم المستخدم</label>
              <Input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} className="font-cairo" />
            </div>
            <div>
              <label className="block text-sm font-cairo text-muted-foreground mb-1">كلمة المرور {editingId && "(اتركها فارغة لعدم التغيير)"}</label>
              <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="font-cairo" />
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
            <Button variant="hero" onClick={handleSave}>{editingId ? "حفظ التعديلات" : "إضافة"}</Button>
            <Button variant="outline" className="font-cairo" onClick={() => { setShowForm(false); setEditingId(null); }}>إلغاء</Button>
          </div>
        </motion.div>
      )}

      {/* Staff List */}
      <div className="space-y-3">
        {filtered.map((s) => (
          <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`bg-card rounded-xl p-5 border border-border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${!s.active ? "opacity-50" : ""}`}>
            <div className="w-12 h-12 rounded-full gradient-emerald flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary-foreground font-cairo">{s.name[0]}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-card-foreground font-cairo">{s.name}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-cairo">{roleLabels[s.role] || s.role}</span>
                {!s.active && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-cairo">معطل</span>}
              </div>
              <p className="text-xs text-muted-foreground font-cairo">@{s.username}</p>
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
              <Button variant="ghost" size="icon" onClick={() => handleToggleActive(s.id)} title={s.active ? "تعطيل" : "تفعيل"}>
                <div className={`w-3 h-3 rounded-full ${s.active ? "bg-emerald" : "bg-destructive"}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                <Edit className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
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
