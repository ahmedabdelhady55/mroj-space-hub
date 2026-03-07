export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Booking {
  id: string;
  type: "public" | "private";
  date: string;
  details: string;
  areaCost: number;
  ordersCost: number;
  totalCost: number;
  orders: OrderItem[];
  pointsEarned: number;
  status: "active" | "completed";
  roomName?: string;
  personCount?: number;
  durationSeconds?: number;
}

const BOOKINGS_KEY = "moroug_bookings";
const ACTIVE_BOOKING_KEY = "moroug_active_booking";

export const getBookings = (): Booking[] => {
  const stored = localStorage.getItem(BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveBooking = (booking: Booking) => {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === booking.id);
  if (idx >= 0) bookings[idx] = booking;
  else bookings.unshift(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

export const getActiveBooking = (): Booking | null => {
  const stored = localStorage.getItem(ACTIVE_BOOKING_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setActiveBooking = (booking: Booking | null) => {
  if (booking) localStorage.setItem(ACTIVE_BOOKING_KEY, JSON.stringify(booking));
  else localStorage.removeItem(ACTIVE_BOOKING_KEY);
};

export const completeActiveBooking = () => {
  const booking = getActiveBooking();
  if (!booking) return null;
  booking.status = "completed";
  
  // Use admin loyalty settings
  const settingsStr = localStorage.getItem("moroug_admin_settings");
  const settings = settingsStr ? JSON.parse(settingsStr) : { pointsPerAmount: 10, amountForPoints: 100 };
  booking.pointsEarned = Math.floor(booking.totalCost / settings.amountForPoints) * settings.pointsPerAmount;
  
  saveBooking(booking);
  setActiveBooking(null);

  // Update user points
  const userStr = localStorage.getItem("moroug_user");
  if (userStr) {
    const user = JSON.parse(userStr);
    user.points = (user.points || 0) + booking.pointsEarned;
    localStorage.setItem("moroug_user", JSON.stringify(user));
  }
  return booking;
};

export const addOrdersToActiveBooking = (orders: OrderItem[]) => {
  const booking = getActiveBooking();
  if (!booking) return null;
  booking.orders = [...booking.orders, ...orders];
  booking.ordersCost = booking.orders.reduce((sum, o) => sum + o.price * o.quantity, 0);
  booking.totalCost = booking.areaCost + booking.ordersCost;
  setActiveBooking(booking);
  saveBooking(booking);
  return booking;
};

export const createPublicAreaBooking = (personCount: number, costPerPerson: number): Booking => {
  const areaCost = personCount * costPerPerson;
  const booking: Booking = {
    id: `MRG-${Date.now().toString(36).toUpperCase()}`,
    type: "public",
    date: new Date().toISOString(),
    details: `${personCount} فرد - مساحة عامة`,
    areaCost,
    ordersCost: 0,
    totalCost: areaCost,
    orders: [],
    pointsEarned: 0,
    status: "active",
    personCount,
  };
  setActiveBooking(booking);
  saveBooking(booking);
  return booking;
};

export const createPrivateRoomBooking = (roomName: string, pricePerHour: number): Booking => {
  const booking: Booking = {
    id: `MRG-${Date.now().toString(36).toUpperCase()}`,
    type: "private",
    date: new Date().toISOString(),
    details: `${roomName} - غرفة خاصة`,
    areaCost: 0,
    ordersCost: 0,
    totalCost: 0,
    orders: [],
    pointsEarned: 0,
    status: "active",
    roomName,
    durationSeconds: 0,
  };
  setActiveBooking(booking);
  saveBooking(booking);
  return booking;
};
