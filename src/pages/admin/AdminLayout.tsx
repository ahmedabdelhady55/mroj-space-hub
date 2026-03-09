import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, DoorOpen, ClipboardList, UtensilsCrossed, 
  Users, Settings, Shield, LogOut, Menu, X, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { title: "الرئيسية", icon: LayoutDashboard, path: "/admin", permission: null },
  { title: "الحجوزات", icon: ClipboardList, path: "/admin/bookings", permission: "bookings_view" },
  { title: "الغرف", icon: DoorOpen, path: "/admin/rooms", permission: "rooms_view" },
  { title: "القائمة", icon: UtensilsCrossed, path: "/admin/menu", permission: "menu_view" },
  { title: "معرض الصور", icon: ImageIcon, path: "/admin/gallery", permission: "settings_manage" },
  { title: "العملاء", icon: Users, path: "/admin/customers", permission: "customers_view" },
  { title: "الموظفين", icon: Shield, path: "/admin/staff", permission: "staff_manage" },
  { title: "الإعدادات", icon: Settings, path: "/admin/settings", permission: "settings_manage" },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [staffPermissions, setStaffPermissions] = useState<string[] | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
      return;
    }
    if (!loading && user && !isAdmin) {
      // Check if user is a moderator (staff)
      const checkStaffAccess = async () => {
        const { data: roleData } = await supabase.rpc("has_role", { _user_id: user.id, _role: "moderator" as any });
        if (!roleData) {
          navigate("/admin/login");
          return;
        }
        // Fetch staff permissions
        const { data: perms } = await supabase
          .from("staff_permissions")
          .select("permissions, active")
          .eq("user_id", user.id)
          .single();
        if (!perms || !perms.active) {
          navigate("/admin/login");
          return;
        }
        setStaffPermissions(Array.isArray(perms.permissions) ? perms.permissions as string[] : []);
      };
      checkStaffAccess();
    }
    if (!loading && user && isAdmin) {
      setStaffPermissions(null); // Admin has all permissions
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (loading) return null;
  if (!user) return null;
  if (!isAdmin && staffPermissions === null && !loading) return null;

  const visibleNav = navItems.filter((item) => {
    if (isAdmin) return true;
    if (!item.permission) return true; // Dashboard always visible
    return staffPermissions?.includes(item.permission);
  });

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-64 gradient-emerald transform transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary font-cairo">mroj</span>
            </div>
            <div>
              <h2 className="text-primary-foreground font-bold font-cairo">مروج</h2>
              <p className="text-primary-foreground/60 text-xs font-cairo">لوحة التحكم</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-primary-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-4 space-y-1">
          {visibleNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-cairo text-sm transition-all ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground font-bold"
                    : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}>
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start text-primary-foreground/60 hover:text-primary-foreground font-cairo" onClick={handleLogout}>
            <LogOut className="w-5 h-5 ml-3" /> تسجيل الخروج
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-foreground font-cairo">
            {navItems.find((i) => i.path === location.pathname)?.title || "لوحة التحكم"}
          </h1>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <span className="text-sm font-cairo text-muted-foreground">{isAdmin ? "مدير" : "موظف"}</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
