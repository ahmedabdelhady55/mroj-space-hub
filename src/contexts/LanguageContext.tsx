import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  "app.name": { ar: "مروج", en: "mroj" },
  "app.subtitle": { ar: "مساحة عملك المثالية", en: "Your Ideal Workspace" },
  "app.start": { ar: "ابدأ الرحلة ✨", en: "Start Your Journey ✨" },
  "auth.welcome": { ar: "أهلاً بك في مروج", en: "Welcome to mroj" },
  "auth.login_prompt": { ar: "سجّل دخولك للبدء", en: "Sign in to get started" },
  "auth.name": { ar: "الاسم الثلاثي", en: "Full Name" },
  "auth.name_placeholder": { ar: "محمد أحمد علي", en: "John Doe" },
  "auth.phone": { ar: "رقم الموبايل", en: "Phone Number" },
  "auth.phone_placeholder": { ar: "01xxxxxxxxx", en: "01xxxxxxxxx" },
  "auth.login": { ar: "تسجيل الدخول", en: "Sign In" },
  "auth.back": { ar: "← العودة", en: "← Back" },
  "home.welcome": { ar: "أهلاً بك يا", en: "Welcome" },
  "home.subtitle": { ar: "مرحباً بك في مروج", en: "Welcome to mroj" },
  "home.points": { ar: "رصيد نقاطك", en: "Your Points" },
  "home.points_unit": { ar: "نقطة", en: "points" },
  "home.gallery": { ar: "معرض الصور", en: "Photo Gallery" },
  "menu.public_areas": { ar: "المساحات العامة", en: "Public Areas" },
  "menu.public_areas_sub": { ar: "مكاتب مشتركة ومقاهي", en: "Shared desks & cafés" },
  "menu.private_rooms": { ar: "الغرف الخاصة", en: "Private Rooms" },
  "menu.private_rooms_sub": { ar: "غرف اجتماعات وعمل خاصة", en: "Meeting & work rooms" },
  "menu.bookings": { ar: "طلباتي وحجوزاتي", en: "My Bookings" },
  "menu.bookings_sub": { ar: "سجل الحجوزات والطلبات", en: "Booking & order history" },
  "menu.profile": { ar: "الملف الشخصي", en: "Profile" },
  "menu.profile_sub": { ar: "بياناتك ونقاط الولاء", en: "Your data & loyalty points" },
  "public.pricing": { ar: "تكلفة الفرد لليوم", en: "Cost per person per day" },
  "public.currency": { ar: "ج.م", en: "EGP" },
  "public.people_count": { ar: "عدد الأفراد", en: "Number of people" },
  "public.total": { ar: "إجمالي التكلفة", en: "Total Cost" },
  "public.confirm": { ar: "تأكيد حجز مساحة عامة", en: "Confirm Public Area Booking" },
  "public.success": { ar: "تم الحجز بنجاح!", en: "Booking Confirmed!" },
  "public.ticket": { ar: "رقم التذكرة", en: "Ticket Number" },
  "public.order_now": { ar: "اطلب الآن من القائمة", en: "Order from Menu Now" },
  "rooms.instant": { ar: "حجز فوري", en: "Book Now" },
  "rooms.future": { ar: "حجز مسبق", en: "Book for Later" },
  "rooms.available": { ar: "متاحة", en: "Available" },
  "rooms.occupied": { ar: "مشغولة", en: "Occupied" },
  "rooms.book_now": { ar: "احجز الآن", en: "Book Now" },
  "rooms.per_hour": { ar: "ج.م/ساعة", en: "EGP/hr" },
  "rooms.capacity": { ar: "أشخاص", en: "people" },
  "rooms.occupied_until": { ar: "مشغولة حتى", en: "Occupied until" },
  "rooms.select_date": { ar: "اختر التاريخ", en: "Select Date" },
  "rooms.select_time": { ar: "اختر الوقت", en: "Select Time" },
  "rooms.show_available": { ar: "عرض الغرف المتاحة", en: "Show Available Rooms" },
  "session.title": { ar: "جلسة نشطة", en: "Active Session" },
  "session.elapsed": { ar: "الوقت المنقضي", en: "Elapsed Time" },
  "session.cost": { ar: "التكلفة الحالية", en: "Current Cost" },
  "session.order": { ar: "اطلب طعام/شراب", en: "Order Food/Drinks" },
  "session.end": { ar: "إنهاء الجلسة والدفع", en: "End Session & Pay" },
  "profile.title": { ar: "الملف الشخصي", en: "Profile" },
  "profile.loyalty": { ar: "نظام الولاء", en: "Loyalty System" },
  "profile.history": { ar: "سجل الحجوزات", en: "Booking History" },
  "nav.back": { ar: "رجوع", en: "Back" },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  toggleLang: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem("moroug_lang");
    return (stored as Language) || "ar";
  });

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("moroug_lang", lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "ar" ? "en" : "ar"));
  const t = (key: string) => translations[key]?.[lang] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
