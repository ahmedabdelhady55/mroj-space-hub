import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, DoorOpen, ClipboardList, UtensilsCrossed, 
  Users, Settings, Shield, LogOut, Menu, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const navItems = [
  { title: "الرئيسية", icon: LayoutDashboard, path: "/admin" },
  { title: "الحجوزات", icon: ClipboardList, path: "/admin/bookings" },
  { title: "الغرف", icon: DoorOpen, path: "/admin/rooms" },
  { title: "القائمة", icon: UtensilsCrossed, path: "/admin/menu" },
  { title: "العملاء", icon: Users, path: "/admin/customers" },
  { title: "الموظفين", icon: Shield, path: "/admin/staff" },
  { title: "الإعدادات", icon: Settings, path: "/admin/settings" },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const admin = localStorage.getItem("moroug_admin");
    if (!admin) navigate("/admin/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("moroug_admin");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-64 gradient-emerald transform transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="مروج" className="w-10 h-10 object-contain" />
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
          {navItems.map((item) => {
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

      {/* Main content */}
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
            <span className="text-sm font-cairo text-muted-foreground">مدير</span>
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
