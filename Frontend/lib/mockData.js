// ServeLoop Mock Data — comprehensive data for all pages

export const mockRestaurant = {
  id: 'r_spicegardenblr',
  slug: 'spice-garden',
  name: 'Spice Garden',
  tagline: 'Authentic Indian cuisine with a modern twist',
  description: 'Award-winning contemporary Indian restaurant serving farm-to-table seasonal dishes. Experience the art of spice in a vibrant, modern setting.',
  type: 'casual_dining',
  serviceModel: 'hybrid',
  cuisine: ['Indian', 'Contemporary', 'Fusion'],
  logo: null,
  coverImage: null,
  brandColor: '#f59e0b',
  location: {
    address: '42 MG Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pincode: '560038',
    lat: 12.9783,
    lng: 77.6408,
  },
  contact: {
    phone: '+91 98765 43210',
    email: 'hello@spicegarden.in',
    website: 'https://spicegarden.in',
  },
  hours: {
    mon: { open: '11:00', close: '23:00', isOpen: true },
    tue: { open: '11:00', close: '23:00', isOpen: true },
    wed: { open: '11:00', close: '23:00', isOpen: true },
    thu: { open: '11:00', close: '23:00', isOpen: true },
    fri: { open: '11:00', close: '00:00', isOpen: true },
    sat: { open: '10:00', close: '00:00', isOpen: true },
    sun: { open: '10:00', close: '22:00', isOpen: true },
  },
  isLive: true,
  rushLevel: 72,
  avgRating: 4.7,
  totalReviews: 1284,
  capacity: {
    tables: 24,
    seatsPerTable: 4,
    totalSeats: 96,
    currentOccupancy: 67,
  },
  branches: 1,
};

export const mockMenuCategories = [
  { id: 'cat_1', name: 'Today\'s Specials', icon: '⭐', itemCount: 4, isSpecial: true },
  { id: 'cat_2', name: 'Starters', icon: '🥗', itemCount: 8 },
  { id: 'cat_3', name: 'Main Course', icon: '🍛', itemCount: 12 },
  { id: 'cat_4', name: 'Breads & Rice', icon: '🫓', itemCount: 6 },
  { id: 'cat_5', name: 'Beverages', icon: '🥤', itemCount: 10 },
  { id: 'cat_6', name: 'Desserts', icon: '🍨', itemCount: 5 },
];

export const mockMenuItems = [
  // Specials
  { id: 'mi_1', categoryId: 'cat_1', name: 'Butter Chicken Taco', price: 320, originalPrice: null, description: 'Slow-cooked murgh makhani in a crispy corn taco shell with mint chutney slaw', isVeg: false, isSpecial: true, availability: 'available', prepTime: 12, rating: 4.9, tags: ['chef-special', 'bestseller'], allergens: ['gluten', 'dairy'], spiceLevel: 2 },
  { id: 'mi_2', categoryId: 'cat_1', name: 'Truffle Dal Makhani', price: 580, originalPrice: 680, description: 'Black lentils slow-cooked overnight with white truffle oil and aged parmesan foam', isVeg: true, isSpecial: true, availability: 'available', prepTime: 15, rating: 4.8, tags: ['chef-special', 'limited'], allergens: ['dairy'], spiceLevel: 1 },
  { id: 'mi_3', categoryId: 'cat_1', name: 'Smoked Lamb Raan', price: 1200, originalPrice: null, description: 'Whole leg of lamb marinated for 48hrs, cold-smoked, and roasted with malabar spices', isVeg: false, isSpecial: true, availability: 'soon', prepTime: 20, rating: 4.7, tags: ['chef-special', 'pre-order'], allergens: [], spiceLevel: 3 },
  { id: 'mi_4', categoryId: 'cat_1', name: 'Rose Phirni Cheesecake', price: 280, originalPrice: null, description: 'Fusion cheesecake with traditional phirni base, rose reduction, and pistachio crumble', isVeg: true, isSpecial: true, availability: 'available', prepTime: 5, rating: 4.6, tags: ['dessert-special'], allergens: ['dairy', 'gluten', 'nuts'], spiceLevel: 0 },
  // Starters
  { id: 'mi_5', categoryId: 'cat_2', name: 'Amritsari Fish Tikka', price: 480, description: 'Freshwater fish marinated in carom seeds & gram flour, char-grilled in tandoor', isVeg: false, availability: 'available', prepTime: 10, rating: 4.6, tags: ['bestseller'], allergens: ['fish', 'gluten'], spiceLevel: 2 },
  { id: 'mi_6', categoryId: 'cat_2', name: 'Paneer Lababdar Skewer', price: 380, description: 'Cottage cheese cubes in creamy tomato marinade with bell peppers on iron skewer', isVeg: true, availability: 'available', prepTime: 10, rating: 4.5, tags: [], allergens: ['dairy'], spiceLevel: 1 },
  { id: 'mi_7', categoryId: 'cat_2', name: 'Chicken 65 Loaded Fries', price: 340, description: 'Crispy spiced chicken 65 piled on masala fries with green chutney drizzle', isVeg: false, availability: 'unavailable', prepTime: 12, rating: 4.3, tags: [], allergens: ['gluten'], spiceLevel: 3 },
  { id: 'mi_8', categoryId: 'cat_2', name: 'Dahi Puri Shots', price: 180, description: 'Classic Mumbai street puri shots with tamarind water, sweet yogurt, and sev', isVeg: true, availability: 'available', prepTime: 5, rating: 4.7, tags: ['popular'], allergens: ['dairy', 'gluten'], spiceLevel: 2 },
  { id: 'mi_9', categoryId: 'cat_2', name: 'Seekh Kebab Platter', price: 520, description: 'Minced lamb seekh with house chutney trio and pickled onions', isVeg: false, availability: 'available', prepTime: 15, rating: 4.4, tags: [], allergens: [], spiceLevel: 2 },
  // Main Course
  { id: 'mi_10', categoryId: 'cat_3', name: 'Butter Chicken', price: 420, description: 'Classic murgh makhani with velvety tomato gravy', isVeg: false, availability: 'available', prepTime: 15, rating: 4.8, tags: ['bestseller'], allergens: ['dairy'], spiceLevel: 1 },
  { id: 'mi_11', categoryId: 'cat_3', name: 'Rogan Josh', price: 480, description: 'Kashmiri slow-braised lamb with aromatic whole spices', isVeg: false, availability: 'available', prepTime: 18, rating: 4.7, tags: [], allergens: [], spiceLevel: 3 },
  { id: 'mi_12', categoryId: 'cat_3', name: 'Paneer Butter Masala', price: 360, description: 'Fresh cottage cheese in rich butter and tomato gravy', isVeg: true, availability: 'available', prepTime: 12, rating: 4.6, tags: ['popular'], allergens: ['dairy'], spiceLevel: 1 },
  { id: 'mi_13', categoryId: 'cat_3', name: 'Chettinad Chicken Curry', price: 440, description: 'Fiery South Indian curry with stone-ground spice paste', isVeg: false, availability: 'soon', prepTime: 18, rating: 4.5, tags: [], allergens: [], spiceLevel: 4 },
  { id: 'mi_14', categoryId: 'cat_3', name: 'Dal Tadka', price: 280, description: 'Yellow lentils tempered with cumin, garlic, and dried red chilies', isVeg: true, availability: 'available', prepTime: 10, rating: 4.4, tags: [], allergens: [], spiceLevel: 2 },
  // Breads
  { id: 'mi_15', categoryId: 'cat_4', name: 'Butter Naan', price: 60, description: 'Soft leavened bread baked in tandoor with butter finish', isVeg: true, availability: 'available', prepTime: 5, rating: 4.5, tags: [], allergens: ['gluten', 'dairy'], spiceLevel: 0 },
  { id: 'mi_16', categoryId: 'cat_4', name: 'Garlic Cheese Naan', price: 90, description: 'Naan stuffed with garlic and melted cheese', isVeg: true, availability: 'available', prepTime: 7, rating: 4.7, tags: ['popular'], allergens: ['gluten', 'dairy'], spiceLevel: 0 },
  { id: 'mi_17', categoryId: 'cat_4', name: 'Jeera Rice', price: 120, description: 'Basmati rice tempered with cumin seeds and ghee', isVeg: true, availability: 'available', prepTime: 8, rating: 4.3, tags: [], allergens: [], spiceLevel: 0 },
  { id: 'mi_18', categoryId: 'cat_4', name: 'Hyderabadi Biryani', price: 380, description: 'Aged basmati layered with dum-cooked mutton, saffron, and caramelized onions', isVeg: false, availability: 'available', prepTime: 20, rating: 4.9, tags: ['bestseller'], allergens: [], spiceLevel: 2 },
  // Beverages
  { id: 'mi_19', categoryId: 'cat_5', name: 'Mango Lassi', price: 140, description: 'Chilled Alphonso mango blended with thick yogurt', isVeg: true, availability: 'available', prepTime: 3, rating: 4.7, tags: ['popular'], allergens: ['dairy'], spiceLevel: 0 },
  { id: 'mi_20', categoryId: 'cat_5', name: 'Masala Chai Latte', price: 120, description: 'Spiced tea with steamed oat milk and cardamom dust', isVeg: true, availability: 'available', prepTime: 4, rating: 4.5, tags: [], allergens: ['dairy'], spiceLevel: 1 },
  { id: 'mi_21', categoryId: 'cat_5', name: 'Virgin Mojito', price: 160, description: 'Fresh lime, mint, and sparkling water with a chaat masala rim', isVeg: true, availability: 'available', prepTime: 3, rating: 4.4, tags: [], allergens: [], spiceLevel: 0 },
  { id: 'mi_22', categoryId: 'cat_5', name: 'Cold Brew Filter Coffee', price: 180, description: '12-hour cold brew using Coorg estate beans, served over ice', isVeg: true, availability: 'unavailable', prepTime: 2, rating: 4.6, tags: [], allergens: [], spiceLevel: 0 },
  // Desserts
  { id: 'mi_23', categoryId: 'cat_6', name: 'Gulab Jamun Sundae', price: 220, description: 'Warm gulab jamun served over vanilla bean ice cream with rose syrup', isVeg: true, availability: 'available', prepTime: 5, rating: 4.8, tags: ['popular'], allergens: ['dairy', 'gluten'], spiceLevel: 0 },
  { id: 'mi_24', categoryId: 'cat_6', name: 'Kulfi Falooda', price: 200, description: 'Hand-churned pistachio kulfi on a bed of rose falooda noodles', isVeg: true, availability: 'available', prepTime: 5, rating: 4.6, tags: [], allergens: ['dairy', 'nuts'], spiceLevel: 0 },
  { id: 'mi_25', categoryId: 'cat_6', name: 'Chocolate Halwa Tart', price: 260, description: 'Dark chocolate tart shell filled with carrot halwa and candied pistachio', isVeg: true, availability: 'soon', prepTime: 7, rating: 4.5, tags: [], allergens: ['dairy', 'gluten', 'nuts'], spiceLevel: 0 },
];

export const mockTables = [
  { id: 'tbl_1', label: 'T1', seats: 2, status: 'occupied', sessionId: 'sess_1', ordersCount: 3, billTotal: 820, waitTime: 32 },
  { id: 'tbl_2', label: 'T2', seats: 4, status: 'free', sessionId: null, ordersCount: 0, billTotal: 0, waitTime: 0 },
  { id: 'tbl_3', label: 'T3', seats: 4, status: 'occupied', sessionId: 'sess_3', ordersCount: 5, billTotal: 1640, waitTime: 48 },
  { id: 'tbl_4', label: 'T4', seats: 2, status: 'reserved', sessionId: null, reservationTime: '20:30', guestName: 'Priya Sharma', ordersCount: 0 },
  { id: 'tbl_5', label: 'T5', seats: 6, status: 'occupied', sessionId: 'sess_5', ordersCount: 8, billTotal: 3240, waitTime: 55 },
  { id: 'tbl_6', label: 'T6', seats: 4, status: 'paying', sessionId: 'sess_6', ordersCount: 4, billTotal: 1180, waitTime: 0 },
  { id: 'tbl_7', label: 'T7', seats: 2, status: 'free', sessionId: null, ordersCount: 0, billTotal: 0, waitTime: 0 },
  { id: 'tbl_8', label: 'T8', seats: 4, status: 'occupied', sessionId: 'sess_8', ordersCount: 2, billTotal: 560, waitTime: 18 },
  { id: 'tbl_9', label: 'T9', seats: 4, status: 'free', sessionId: null, ordersCount: 0, billTotal: 0, waitTime: 0 },
  { id: 'tbl_10', label: 'T10', seats: 2, status: 'dirty', sessionId: null, ordersCount: 0, billTotal: 0, waitTime: 0 },
  { id: 'tbl_11', label: 'T11', seats: 6, status: 'occupied', sessionId: 'sess_11', ordersCount: 6, billTotal: 2840, waitTime: 40 },
  { id: 'tbl_12', label: 'T12', seats: 4, status: 'reserved', sessionId: null, reservationTime: '21:00', guestName: 'Arjun Mehta', ordersCount: 0 },
  { id: 'tbl_13', label: 'T13', seats: 4, status: 'free', sessionId: null, ordersCount: 0, billTotal: 0, waitTime: 0 },
  { id: 'tbl_14', label: 'T14', seats: 2, status: 'occupied', sessionId: 'sess_14', ordersCount: 3, billTotal: 740, waitTime: 22 },
  { id: 'tbl_15', label: 'T15', seats: 8, status: 'occupied', sessionId: 'sess_15', ordersCount: 10, billTotal: 4200, waitTime: 60 },
  { id: 'tbl_16', label: 'T16', seats: 4, status: 'free', sessionId: null, ordersCount: 0, billTotal: 0, waitTime: 0 },
];

export const mockOrders = [
  { id: 'ord_1', tableId: 'tbl_1', tableLabel: 'T1', status: 'pending', createdAt: new Date(Date.now() - 5*60000), items: [{ itemId: 'mi_10', name: 'Butter Chicken', qty: 2, price: 420 }, { itemId: 'mi_15', name: 'Butter Naan', qty: 4, price: 60 }], total: 1080, guestNote: 'Less spicy please' },
  { id: 'ord_2', tableId: 'tbl_3', tableLabel: 'T3', status: 'preparing', createdAt: new Date(Date.now() - 12*60000), items: [{ itemId: 'mi_18', name: 'Hyderabadi Biryani', qty: 2, price: 380 }, { itemId: 'mi_19', name: 'Mango Lassi', qty: 2, price: 140 }], total: 1040, guestNote: '' },
  { id: 'ord_3', tableId: 'tbl_5', tableLabel: 'T5', status: 'ready', createdAt: new Date(Date.now() - 20*60000), items: [{ itemId: 'mi_1', name: 'Butter Chicken Taco', qty: 3, price: 320 }, { itemId: 'mi_5', name: 'Amritsari Fish Tikka', qty: 1, price: 480 }], total: 1440, guestNote: '' },
  { id: 'ord_4', tableId: 'tbl_8', tableLabel: 'T8', status: 'pending', createdAt: new Date(Date.now() - 2*60000), items: [{ itemId: 'mi_12', name: 'Paneer Butter Masala', qty: 1, price: 360 }, { itemId: 'mi_16', name: 'Garlic Cheese Naan', qty: 2, price: 90 }], total: 540, guestNote: 'Extra gravy' },
  { id: 'ord_5', tableId: 'tbl_11', tableLabel: 'T11', status: 'preparing', createdAt: new Date(Date.now() - 8*60000), items: [{ itemId: 'mi_11', name: 'Rogan Josh', qty: 2, price: 480 }, { itemId: 'mi_17', name: 'Jeera Rice', qty: 2, price: 120 }], total: 1200, guestNote: '' },
  { id: 'ord_6', tableId: 'tbl_14', tableLabel: 'T14', status: 'served', createdAt: new Date(Date.now() - 35*60000), items: [{ itemId: 'mi_8', name: 'Dahi Puri Shots', qty: 2, price: 180 }, { itemId: 'mi_14', name: 'Dal Tadka', qty: 1, price: 280 }], total: 640, guestNote: '' },
  { id: 'ord_7', tableId: 'tbl_15', tableLabel: 'T15', status: 'pending', createdAt: new Date(Date.now() - 1*60000), items: [{ itemId: 'mi_2', name: 'Truffle Dal Makhani', qty: 1, price: 580 }, { itemId: 'mi_24', name: 'Kulfi Falooda', qty: 2, price: 200 }], total: 980, guestNote: 'Allergy: nuts' },
];

export const mockReservations = [
  { id: 'res_1', guestName: 'Priya Sharma', partySize: 2, date: 'Today', time: '20:30', tableId: 'tbl_4', status: 'confirmed', phone: '+91 98001 12345', notes: 'Anniversary dinner', createdAt: new Date(Date.now() - 2*3600000) },
  { id: 'res_2', guestName: 'Arjun Mehta', partySize: 4, date: 'Today', time: '21:00', tableId: 'tbl_12', status: 'confirmed', phone: '+91 98765 55555', notes: '', createdAt: new Date(Date.now() - 1*3600000) },
  { id: 'res_3', guestName: 'Kavita Nair', partySize: 6, date: 'Tomorrow', time: '19:30', tableId: null, status: 'pending', phone: '+91 98800 99900', notes: 'Vegetarian menu preferred', createdAt: new Date(Date.now() - 0.5*3600000) },
  { id: 'res_4', guestName: 'Rajan Patel', partySize: 2, date: 'Today', time: '22:00', tableId: null, status: 'pending', phone: '+91 97700 44400', notes: '', createdAt: new Date(Date.now() - 0.25*3600000) },
];

export const mockQueue = [
  { id: 'q_1', guestName: 'Sunita Roy', partySize: 3, waitSince: new Date(Date.now() - 15*60000), estimatedWait: 10, token: 'Q01', phone: '+91 98000 10001' },
  { id: 'q_2', guestName: 'Mohammed Irfan', partySize: 2, waitSince: new Date(Date.now() - 10*60000), estimatedWait: 15, token: 'Q02', phone: '+91 99001 20002' },
  { id: 'q_3', guestName: 'Nandini Iyer', partySize: 4, waitSince: new Date(Date.now() - 5*60000), estimatedWait: 25, token: 'Q03', phone: '+91 97005 30003' },
];

export const mockAnalytics = {
  today: {
    revenue: 48420,
    orders: 87,
    avgOrderValue: 556,
    tablesTurned: 34,
    topItems: [
      { name: 'Hyderabadi Biryani', count: 28, revenue: 10640 },
      { name: 'Butter Chicken', count: 24, revenue: 10080 },
      { name: 'Butter Chicken Taco', count: 19, revenue: 6080 },
      { name: 'Garlic Cheese Naan', count: 45, revenue: 4050 },
      { name: 'Mango Lassi', count: 38, revenue: 5320 },
    ],
    peakHours: [
      { hour: '11', orders: 4 }, { hour: '12', orders: 14 }, { hour: '13', orders: 22 },
      { hour: '14', orders: 18 }, { hour: '15', orders: 8 }, { hour: '16', orders: 5 },
      { hour: '17', orders: 7 }, { hour: '18', orders: 11 }, { hour: '19', orders: 24 },
      { hour: '20', orders: 28 }, { hour: '21', orders: 20 }, { hour: '22', orders: 12 },
    ],
  },
  week: {
    revenue: [32000, 38500, 41200, 36800, 44100, 52800, 48420],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  month: { revenue: 1280000, ordersTotal: 2340, newCustomers: 486, repeatCustomers: 312 },
};

export const mockCustomers = [
  { id: 'cust_1', name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98001 12345', visits: 12, totalSpent: 18420, lastVisit: '2 days ago', isMember: true, tier: 'Gold', points: 1842, favorites: ['mi_10', 'mi_18'] },
  { id: 'cust_2', name: 'Arjun Mehta', email: 'arjun@email.com', phone: '+91 98765 55555', visits: 7, totalSpent: 9800, lastVisit: 'Today', isMember: true, tier: 'Silver', points: 980, favorites: ['mi_2', 'mi_11'] },
  { id: 'cust_3', name: 'Rohit Sinha', email: 'rohit@email.com', phone: '+91 99988 77766', visits: 3, totalSpent: 3400, lastVisit: '1 week ago', isMember: false, tier: null, points: 0, favorites: ['mi_8'] },
  { id: 'cust_4', name: 'Divya Menon', email: 'divya@email.com', phone: '+91 96600 88800', visits: 21, totalSpent: 42800, lastVisit: 'Yesterday', isMember: true, tier: 'Platinum', points: 4280, favorites: ['mi_18', 'mi_23', 'mi_19'] },
];

export const mockStaff = [
  { id: 'staff_1', name: 'Ravi Kumar', role: 'manager', email: 'ravi@spicegarden.in', phone: '+91 98000 00001', shift: 'day', status: 'active', avatar: null },
  { id: 'staff_2', name: 'Anjali Bose', role: 'waiter', email: 'anjali@spicegarden.in', phone: '+91 98000 00002', shift: 'day', status: 'active', avatar: null },
  { id: 'staff_3', name: 'Deepak Sharma', role: 'waiter', email: 'deepak@spicegarden.in', phone: '+91 98000 00003', shift: 'evening', status: 'active', avatar: null },
  { id: 'staff_4', name: 'Fatima Khan', role: 'kitchen', email: 'fatima@spicegarden.in', phone: '+91 98000 00004', shift: 'day', status: 'active', avatar: null },
  { id: 'staff_5', name: 'Samuel George', role: 'kitchen', email: 'samuel@spicegarden.in', phone: '+91 98000 00005', shift: 'evening', status: 'on_break', avatar: null },
  { id: 'staff_6', name: 'Pooja Reddy', role: 'front_desk', email: 'pooja@spicegarden.in', phone: '+91 98000 00006', shift: 'day', status: 'active', avatar: null },
];

export const mockDiscoveryRestaurants = [
  { id: 'r_1', slug: 'spice-garden', name: 'Spice Garden', cuisine: 'Indian • Contemporary', type: 'casual_dining', rating: 4.7, reviews: 1284, isLive: true, rushLevel: 72, location: 'Indiranagar', distance: '0.8 km', priceRange: '₹₹₹', coverImage: null, tags: ['dine-in', 'reservations', 'veg-friendly'] },
  { id: 'r_2', slug: 'saffron-house', name: 'Saffron House', cuisine: 'Mughlai • North Indian', type: 'premium_dining', rating: 4.5, reviews: 892, isLive: true, rushLevel: 45, location: 'Koramangala', distance: '1.4 km', priceRange: '₹₹₹₹', coverImage: null, tags: ['fine-dining', 'bar', 'live-music'] },
  { id: 'r_3', slug: 'chai-stop', name: 'Chai Stop', cuisine: 'Snacks • Tea • Chaat', type: 'quick_service', rating: 4.3, reviews: 2108, isLive: true, rushLevel: 90, location: 'HSR Layout', distance: '2.1 km', priceRange: '₹', coverImage: null, tags: ['quick-bites', 'takeaway'] },
  { id: 'r_4', slug: 'bamboo-bowl', name: 'Bamboo Bowl', cuisine: 'Pan-Asian • Chinese', type: 'casual_dining', rating: 4.4, reviews: 743, isLive: false, rushLevel: 0, location: 'Whitefield', distance: '3.2 km', priceRange: '₹₹', coverImage: null, tags: ['dine-in', 'takeaway'] },
  { id: 'r_5', slug: 'the-pita-co', name: 'The Pita Co', cuisine: 'Mediterranean • Lebanese', type: 'quick_service', rating: 4.6, reviews: 1560, isLive: true, rushLevel: 30, location: 'MG Road', distance: '1.1 km', priceRange: '₹₹', coverImage: null, tags: ['vegan', 'gluten-free', 'takeaway'] },
  { id: 'r_6', slug: 'rooftop-grille', name: 'Rooftop Grille', cuisine: 'BBQ • Grill • American', type: 'casual_dining', rating: 4.2, reviews: 589, isLive: true, rushLevel: 55, location: 'Domlur', distance: '2.8 km', priceRange: '₹₹₹', coverImage: null, tags: ['outdoor', 'bar', 'dine-in'] },
];

export const mockSession = {
  id: 'sess_demo',
  tableId: 'tbl_1',
  tableLabel: 'T1',
  restaurantId: 'r_spicegardenblr',
  startedAt: new Date(Date.now() - 40*60000),
  status: 'active',
  guestCount: 2,
  orders: [
    { id: 'ord_demo_1', status: 'served', placedAt: new Date(Date.now() - 35*60000), items: [{ name: 'Dahi Puri Shots', qty: 2, price: 180, total: 360 }], subtotal: 360 },
    { id: 'ord_demo_2', status: 'preparing', placedAt: new Date(Date.now() - 10*60000), items: [{ name: 'Butter Chicken', qty: 1, price: 420, total: 420 }, { name: 'Garlic Cheese Naan', qty: 2, price: 90, total: 180 }, { name: 'Mango Lassi', qty: 2, price: 140, total: 280 }], subtotal: 880 },
  ],
  subtotal: 1240,
  tax: 124,
  serviceCharge: 62,
  total: 1426,
};

export const mockInventory = [
  { id: 'inv_1', name: 'Chicken (Fresh)', unit: 'kg', current: 8.5, min: 5, max: 20, status: 'ok' },
  { id: 'inv_2', name: 'Lamb (Boneless)', unit: 'kg', current: 2.1, min: 3, max: 10, status: 'low' },
  { id: 'inv_3', name: 'Paneer', unit: 'kg', current: 6.0, min: 4, max: 15, status: 'ok' },
  { id: 'inv_4', name: 'Basmati Rice', unit: 'kg', current: 12.0, min: 8, max: 25, status: 'ok' },
  { id: 'inv_5', name: 'Cream (Heavy)', unit: 'L', current: 1.2, min: 2, max: 8, status: 'low' },
  { id: 'inv_6', name: 'Tomatoes', unit: 'kg', current: 9.0, min: 6, max: 20, status: 'ok' },
  { id: 'inv_7', name: 'Ginger-Garlic Paste', unit: 'kg', current: 0.8, min: 1, max: 5, status: 'critical' },
  { id: 'inv_8', name: 'Flour (Wheat)', unit: 'kg', current: 15.0, min: 10, max: 30, status: 'ok' },
  { id: 'inv_9', name: 'Butter', unit: 'kg', current: 3.5, min: 2, max: 8, status: 'ok' },
  { id: 'inv_10', name: 'Mango Pulp', unit: 'L', current: 0.5, min: 1, max: 5, status: 'critical' },
];

// Pulse dashboard metrics
export const mockPulse = {
  rushLevel: 72,
  activeOrders: 7,
  activeTables: 9,
  pendingOrders: 3,
  delayedOrders: 1,
  lowStockItems: 2,
  criticalItems: 2,
  todayRevenue: 48420,
  targetRevenue: 60000,
  avgWaitTime: 14,
  tablesTurnedToday: 34,
};
