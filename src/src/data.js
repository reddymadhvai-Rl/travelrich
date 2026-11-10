// Mock data for the travel agency admin panel. Replace with real API calls later.

const day = 86400000;
const addDays = (n) => new Date(Date.now() + n * day);
export const fmtDate = (d) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const vehicles = [
  { id: 1, number: "TS 09 UA 1234", type: "Innova Crysta", seats: 7, driver: "Ramesh Kumar", status: "Online", trip: "On Trip", notes: "AC serviced, GPS fitted" },
  { id: 2, number: "TS 08 UB 4521", type: "Tempo Traveller", seats: 12, driver: "Suresh Reddy", status: "Online", trip: "On Trip", notes: "Push-back seats, music system" },
  { id: 3, number: "AP 28 TC 7788", type: "Volvo Bus", seats: 45, driver: "Mahesh Goud", status: "Online", trip: "No Booking", notes: "Sleeper coach, long routes" },
  { id: 4, number: "TS 10 UC 3344", type: "Swift Dzire", seats: 4, driver: "Anil Yadav", status: "Offline", trip: "No Booking", notes: "Insurance renewal pending" },
  { id: 5, number: "TS 07 UD 9012", type: "Ertiga", seats: 6, driver: "Venkat Rao", status: "Online", trip: "Booked", notes: "Family trips" },
  { id: 6, number: "TS 09 UE 5566", type: "Mini Bus", seats: 24, driver: "Kiran Kumar", status: "Offline", trip: "No Booking", notes: "Permit renewal due" },
  { id: 7, number: "AP 09 TF 2210", type: "Innova", seats: 7, driver: "Prasad N", status: "Online", trip: "On Trip", notes: "Highway trips" },
  { id: 8, number: "TS 12 UG 6070", type: "Tempo Traveller", seats: 12, driver: "Naresh B", status: "Online", trip: "Booked", notes: "Corporate pickups" },
  { id: 9, number: "TS 06 UH 1100", type: "Innova", seats: 7, driver: "Naresh B", status: "Offline", trip: "No Booking", notes: "Under repair – engine overheating" },
];

export const drivers = [
  { id: 1, aadhaar: "4821 7305 1196", name: "Ramesh Kumar", phone: "98480 11122", license: "TS0920190012345", expiry: fmtDate(addDays(210)), status: "On Duty", notes: "8 years experience, outstation trips" },
  { id: 2, aadhaar: "5932 1048 7731", name: "Suresh Reddy", phone: "99890 22334", license: "TS0820180054321", expiry: fmtDate(addDays(45)), status: "On Duty", notes: "Licence renewal due soon" },
  { id: 3, aadhaar: "3076 8812 4459", name: "Mahesh Goud", phone: "90000 33445", license: "AP2820170098765", expiry: fmtDate(addDays(400)), status: "On Duty", notes: "Heavy vehicle (bus) licence" },
  { id: 4, aadhaar: "6410 2297 8803", name: "Anil Yadav", phone: "98660 44556", license: "TS1020200011223", expiry: fmtDate(addDays(12)), status: "Off Duty", notes: "Licence expires in 12 days" },
  { id: 5, aadhaar: "7154 9031 2264", name: "Venkat Rao", phone: "97010 55667", license: "TS0720160077889", expiry: fmtDate(addDays(300)), status: "On Duty", notes: "Family & tourist trips" },
  { id: 6, aadhaar: "2289 5546 1073", name: "Kiran Kumar", phone: "96030 66778", license: "TS0920210033445", expiry: fmtDate(addDays(520)), status: "Off Duty", notes: "Mini bus specialist" },
  { id: 7, aadhaar: "8803 1472 6615", name: "Prasad N", phone: "94400 77889", license: "AP0920190066778", expiry: fmtDate(addDays(260)), status: "On Duty", notes: "Highway driver" },
  { id: 8, aadhaar: "9167 3350 4928", name: "Naresh B", phone: "93900 88990", license: "TS1220180044556", expiry: fmtDate(addDays(330)), status: "On Duty", notes: "Corporate & airport pickups" },
];

export const bookings = [
  { id: "BK-1021", customer: "Sri Lakshmi Travels", route: "Hyderabad → Tirupati", vehicle: "TS 09 UA 1234", date: fmtDate(addDays(0)), amount: 18500, status: "Ongoing", notes: "2 days, night halt at Tirupati" },
  { id: "BK-1022", customer: "Rao Family", route: "Hyderabad → Srisailam", vehicle: "TS 07 UD 9012", date: fmtDate(addDays(1)), amount: 9800, status: "Confirmed", notes: "Family of 6, early morning pickup" },
  { id: "BK-1023", customer: "TechNova Pvt Ltd", route: "Airport Pickup (Corporate)", vehicle: "TS 12 UG 6070", date: fmtDate(addDays(2)), amount: 4200, status: "Confirmed", notes: "Corporate invoice required" },
  { id: "BK-1024", customer: "Green Valley School", route: "Hyderabad → Ramoji Film City", vehicle: "AP 28 TC 7788", date: fmtDate(addDays(-1)), amount: 32000, status: "Completed", notes: "School picnic, 40 students" },
  { id: "BK-1025", customer: "Mr. Prakash", route: "Hyderabad → Vijayawada", vehicle: "AP 09 TF 2210", date: fmtDate(addDays(0)), amount: 14500, status: "Ongoing", notes: "One-way drop" },
  { id: "BK-1026", customer: "Anitha Weddings", route: "Local Wedding Package", vehicle: "TS 08 UB 4521", date: fmtDate(addDays(0)), amount: 21000, status: "Ongoing", notes: "Decorated vehicle, 10 hours" },
];

export const expenses = [
  { id: 1, date: fmtDate(addDays(0)), vehicle: "TS 09 UA 1234", category: "Fuel", amount: 4200, note: "Diesel – 45 L" },
  { id: 2, date: fmtDate(addDays(-1)), vehicle: "AP 28 TC 7788", category: "Toll", amount: 1350, note: "Hyd–Vijayawada" },
  { id: 3, date: fmtDate(addDays(-2)), vehicle: "TS 08 UB 4521", category: "Maintenance", amount: 6800, note: "Brake pads" },
  { id: 4, date: fmtDate(addDays(-3)), vehicle: "TS 10 UC 3344", category: "Fuel", amount: 2900, note: "Petrol – 28 L" },
  { id: 5, date: fmtDate(addDays(-4)), vehicle: "TS 06 UH 1100", category: "Driver Allowance", amount: 1500, note: "Night halt" },
];

export const payments = [
  { id: "PAY-501", booking: "BK-1021", customer: "Sri Lakshmi Travels", amount: 18500, mode: "UPI", status: "Paid" },
  { id: "PAY-502", booking: "BK-1022", customer: "Rao Family", amount: 5000, mode: "Cash", status: "Partial" },
  { id: "PAY-503", booking: "BK-1023", customer: "TechNova Pvt Ltd", amount: 4200, mode: "Bank Transfer", status: "Pending" },
  { id: "PAY-504", booking: "BK-1024", customer: "Green Valley School", amount: 32000, mode: "Cheque", status: "Paid" },
  { id: "PAY-505", booking: "BK-1025", customer: "Mr. Prakash", amount: 7000, mode: "UPI", status: "Partial" },
  { id: "PAY-506", booking: "BK-1026", customer: "Anitha Weddings", amount: 21000, mode: "Card", status: "Paid" },
];

export const tracking = [
  { id: 1, vehicle: "TS 09 UA 1234", driver: "Ramesh Kumar", lat: 15.8281, lng: 78.0373, location: "Kurnool Bypass", speed: "62 km/h", updated: "2 min ago" },
  { id: 2, vehicle: "TS 08 UB 4521", driver: "Suresh Reddy", lat: 17.4401, lng: 78.3489, location: "Gachibowli, Hyderabad", speed: "28 km/h", updated: "1 min ago" },
  { id: 3, vehicle: "AP 09 TF 2210", driver: "Prasad N", lat: 17.1405, lng: 79.6236, location: "Suryapet Toll Plaza", speed: "0 km/h", updated: "4 min ago" },
  { id: 4, vehicle: "AP 28 TC 7788", driver: "Mahesh Goud", lat: 16.5062, lng: 80.648, location: "Vijayawada", speed: "45 km/h", updated: "3 min ago" },
  { id: 5, vehicle: "TS 10 UC 3344", driver: "Anil Yadav", lat: 17.4399, lng: 78.4983, location: "Secunderabad", speed: "0 km/h", updated: "25 min ago" },
  { id: 6, vehicle: "TS 07 UD 9012", driver: "Venkat Rao", lat: 17.3283, lng: 78.605, location: "Hayathnagar, Hyderabad", speed: "18 km/h", updated: "2 min ago" },
  { id: 7, vehicle: "TS 09 UE 5566", driver: "Kiran Kumar", lat: 17.4058, lng: 78.5591, location: "Uppal, Hyderabad", speed: "0 km/h", updated: "40 min ago" },
  { id: 8, vehicle: "TS 12 UG 6070", driver: "Naresh B", lat: 17.2403, lng: 78.4294, location: "Rajiv Gandhi Airport, Shamshabad", speed: "22 km/h", updated: "1 min ago" },
  { id: 9, vehicle: "TS 06 UH 1100", driver: "Naresh B", lat: 17.2733, lng: 78.4017, location: "Shamshabad ORR", speed: "0 km/h", updated: "12 min ago" },
];

export const users = [
  { id: 1, name: "Admin", email: "admin@travel.com", password: "Admin@123", phone: "98480 00001", role: "Super Admin", status: "Active" },
  { id: 2, name: "Madhavi", email: "madhavi@travel.com", password: "Madhavi@123", phone: "98480 00002", role: "Manager", status: "Active" },
  { id: 3, name: "Rajesh", email: "rajesh@travel.com", password: "Rajesh@123", phone: "99120 77001", role: "Dispatcher", status: "Active" },
  { id: 4, name: "Sunitha", email: "sunitha@travel.com", password: "Sunitha@123", phone: "98480 00004", role: "Accountant", status: "Inactive" },
];

// ------- Dashboard data -------
export const importantAlerts = [
  { id: 1, vehicle: "TS 10 UC 3344", type: "Insurance", daysLeft: -3 },
  { id: 2, vehicle: "TS 08 UB 4521", type: "Fitness Certificate", daysLeft: 4 },
  { id: 3, vehicle: "AP 28 TC 7788", type: "Pollution (PUC)", daysLeft: 9 },
  { id: 4, vehicle: "TS 09 UE 5566", type: "Permit", daysLeft: 15 },
  { id: 5, vehicle: "TS 07 UD 9012", type: "Road Tax", daysLeft: 22 },
  { id: 6, vehicle: "TS 09 UA 1234", type: "Service Due", daysLeft: 6 },
].map((a) => ({ ...a, expiry: fmtDate(addDays(a.daysLeft)) }));

export const onLeaveToday = [
  { id: 1, name: "Anil Yadav", role: "Driver", phone: "98660 44556" },
  { id: 2, name: "Kiran Kumar", role: "Driver", phone: "96030 66778" },
  { id: 3, name: "Lavanya P", role: "Booking Executive", phone: "90300 11890" },
];

export const attendanceToday = {
  present: [
    { id: 1, name: "Ramesh Kumar", role: "Driver", phone: "98480 11122", time: "06:02 AM" },
    { id: 2, name: "Suresh Reddy", role: "Driver", phone: "99890 22334", time: "06:15 AM" },
    { id: 3, name: "Mahesh Goud", role: "Driver", phone: "90000 33445", time: "06:30 AM" },
    { id: 4, name: "Venkat Rao", role: "Driver", phone: "97010 55667", time: "07:05 AM" },
    { id: 5, name: "Rajesh", role: "Dispatcher", phone: "99120 77001", time: "09:00 AM" },
  ],
  leave: onLeaveToday,
};

export const breakdownsToday = [
  { id: 1, vehicle: "TS 06 UH 1100", driver: "Naresh B", location: "Shamshabad ORR", issue: "Engine overheating", time: "10:40 AM", status: "Mechanic Sent" },
  { id: 2, vehicle: "AP 09 TF 2210", driver: "Prasad N", location: "Suryapet Highway", issue: "Tyre puncture", time: "01:15 PM", status: "Resolved" },
];

export const expenseHeads = [
  { id: 1, name: "Fuel", description: "Diesel / petrol / CNG", status: "Active" },
  { id: 2, name: "Toll", description: "Toll plaza and FASTag charges", status: "Active" },
  { id: 3, name: "Maintenance", description: "Repairs, servicing and spares", status: "Active" },
  { id: 4, name: "Driver Allowance", description: "Batta, night halt and food", status: "Active" },
  { id: 5, name: "Tyres", description: "Tyre purchase and puncture", status: "Active" },
  { id: 6, name: "Insurance", description: "Vehicle insurance premium", status: "Active" },
  { id: 7, name: "Other", description: "Miscellaneous expenses", status: "Active" },
];

// staff used by the attendance pages
export const staff = [
  ...drivers.map((d) => ({ id: "D" + d.id, name: d.name, role: "Driver", phone: d.phone })),
  { id: "U1", name: "Madhavi", role: "Manager", phone: "98480 00002" },
  { id: "U2", name: "Rajesh", role: "Dispatcher", phone: "99120 77001" },
  { id: "U3", name: "Lavanya P", role: "Booking Executive", phone: "90300 11890" },
];
