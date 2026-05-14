import * as XLSX from "xlsx";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Users,
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Building2,
  MapPin,
  Clock,
  Download,
  UserCheck,
  Home,
  Bell,
  Check,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  Edit,
  Pencil,
  X
} from "lucide-react";
import { Personnel, YearPlan, BookingLog, DutyRoster, DIVISIONS } from "./types";
import { api } from "./api"; // ← เชื่อมต่อข้อมูลผ่าน API Proxy ไปยังฐานข้อมูล
import { formatDateThai, formatShortDateThai, formatMonthYearThai } from "./utils/dateUtils";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "yearPlan" | "booking" | "search" | "duty">("dashboard");
  const [userDivision, setUserDivision] = useState<string | null>(localStorage.getItem("userDivision"));
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [yearPlans, setYearPlans] = useState<YearPlan[]>([]);
  const [bookingLogs, setBookingLogs] = useState<BookingLog[]>([]);
  const [dutyRoster, setDutyRoster] = useState<DutyRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info", text: string } | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // ─── ดึงข้อมูลจากฐานข้อมูล ───
  const fetchData = async () => {
    try {
      const [resP, resY, resB, resD] = await Promise.all([
        api.getPersonnel(),
        api.getYearPlan(),
        api.getBookingLog(),
        api.getDutyRoster(),
      ]);
      
      const pData = Array.isArray(resP) ? resP : [];
      const yData = Array.isArray(resY) ? resY : [];
      const bData = Array.isArray(resB) ? resB : [];
      const dData = Array.isArray(resD) ? resD : [];

      setPersonnel(pData);
      setYearPlans(yData);
      setBookingLogs(bData);
      setDutyRoster(dData);
    } catch (err) {
      console.error("Failed to fetch data from Database:", err);
      showMessage("error", "เชื่อมต่อฐานข้อมูลไม่ได้ — โปรดตรวจสอบการเชื่อมต่อ Supabase");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    if (type !== "info") {
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleLogin = (div: string) => {
    setUserDivision(div);
    localStorage.setItem("userDivision", div);
    showMessage("success", `เข้าสู่ระบบในนาม ${div}`);
  };

  const handleLogout = () => {
    setUserDivision(null);
    localStorage.removeItem("userDivision");
    showMessage("info", "ออกจากระบบเรียบร้อยแล้ว");
  };

  const handleDeleteYearPlan = async (id: string) => {
    console.log("Global: handleDeleteYearPlan called for ID:", id);
    try {
      showMessage("info", "กำลังลบแผนงานและข้อมูลที่เกี่ยวข้อง...");
      await api.deleteYearPlan(id);
      showMessage("success", "ลบแผนงานสำเร็จ");
      fetchData();
    } catch (err: any) {
      console.error("Global: Delete YearPlan Error:", err);
      showMessage("error", "ไม่สามารถลบแผนงานได้: " + (err.message || "Unknown error"));
    }
  };

  const handleCancelBooking = async (bookingId: string, personName: string = "บุคลากรท่านนี้") => {
    console.log("Global: handleCancelBooking called for ID:", bookingId);
    if (!window.confirm(`คุณต้องการยกเลิกการใช้รายชื่อ ${personName} ใช่หรือไม่?`)) return;

    try {
      showMessage("info", "กำลังยกเลิกรายชื่อ...");
      const result = await api.deleteBooking(bookingId);
      console.log("Global: Delete Booking Result:", result);
      showMessage("success", "ยกเลิกรายชื่อสำเร็จ");
      fetchData();
    } catch (err: any) {
      console.error("Global: Delete Booking Error:", err);
      showMessage("error", "ไม่สามารถยกเลิกรายชื่อได้: " + (err.message || "Unknown error"));
    }
  };
  
  const handleDeletePersonnel = async (id: string, name: string) => {
    if (!window.confirm(`คุณต้องการลบข้อมูลของ ${name} ใช่หรือไม่?\n(ข้อมูลประวัติเวรและการจัดสรรทั้งหมดของท่านนี้จะถูกลบไปด้วย)`)) return;
    
    try {
      showMessage("info", "กำลังลบข้อมูลกำลังพล...");
      await api.deletePersonnel(id);
      showMessage("success", "ลบข้อมูลกำลังพลสำเร็จ");
      fetchData();
    } catch (err: any) {
      showMessage("error", "ไม่สามารถลบได้: " + (err.message || ""));
    }
  };

  if (!userDivision) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="bg-blue-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight leading-tight">ระบบบริหารจัดการ<br/>แผนปฏิบัติการ</h1>
            <p className="text-blue-100 text-xs mt-2 opacity-80 uppercase tracking-widest font-bold">Personnel & Planning System</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1 underline underline-offset-4 decoration-blue-500">เลือกกองงานของคุณเพื่อเข้าใช้งาน</label>
              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {DIVISIONS.map(div => (
                  <button
                    key={div}
                    onClick={() => handleLogin(div)}
                    className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-left group"
                  >
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{div}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">กรมกำลังพลทหาร | กองการรบพิเศษา</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const availablePersonnel = Array.isArray(personnel) ? personnel.filter(p => {
    // สำหรับ Summary Card: นับคนที่ "ว่างในวันนี้"
    const today = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"
    const hasDutyToday = (Array.isArray(dutyRoster) && dutyRoster.some(d => d.monthYear === today && d.personnelId === p.id && (d.status === "เข้าเวร" || d.status.includes("ลา"))));
    
    // และดูว่าวันนี้ถูกจองตัวไปงานไหนหรือไม่
    const todayBooking = Array.isArray(bookingLogs) && bookingLogs.some(b => {
      const e = yearPlans.find(plan => plan.id === b.eventId);
      return e && today >= e.startDate && today <= e.endDate && b.personnelId === p.id;
    });

    return !hasDutyToday && !todayBooking;
  }) : [];

  const monthPlansCount = Array.isArray(yearPlans) ? yearPlans.filter(p => p.startDate && p.startDate.startsWith(currentMonth)).length : 0;

  return (
    <div id="app-container" className="flex h-screen bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside id="sidebar" className="w-64 bg-[#0f172a] text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20 text-white">กพ.</div>
            <h1 className="text-sm font-bold leading-tight">ระบบจัดสรร<br/>กำลังพลทหาร</h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold opacity-60">Operations Unit</p>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <div className="px-6 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">เมนูหลัก</div>
          
          <SidebarItem 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")} 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="แผงควบคุมหลัก" 
            id="nav-dashboard"
          />
          <SidebarItem 
            active={activeTab === "yearPlan"} 
            onClick={() => setActiveTab("yearPlan")} 
            icon={<Calendar className="w-4 h-4" />} 
            label="แผนวาระงาน" 
            id="nav-yearplan"
          />
          <SidebarItem 
            active={activeTab === "booking"} 
            onClick={() => setActiveTab("booking")} 
            icon={<UserCheck className="w-4 h-4" />} 
            label="จองตัวกำลังพล" 
            id="nav-booking"
          />
          <SidebarItem 
            active={activeTab === "duty"} 
            onClick={() => setActiveTab("duty")} 
            icon={<Clock className="w-4 h-4" />} 
            label="การจัดการเวรและการลา" 
            id="nav-duty"
          />
          <SidebarItem 
            active={activeTab === "search"} 
            onClick={() => setActiveTab("search")} 
            icon={<Search className="w-4 h-4" />} 
            label="ตรวจสอบสถานะ" 
            id="nav-search"
          />
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-black ring-2 ring-blue-500/30 text-white">
              {userDivision?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black truncate text-slate-100">{userDivision}</p>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Authorized Officer</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
              title="ออกจากระบบ"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0 relative h-full">
        <header id="top-header" className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-96 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all border border-transparent focus-within:border-blue-400/30">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="ค้นหาข้อมูลรายชื่อ หรือ งานโครงการ..." 
              value={globalSearch}
              onFocus={() => setActiveTab("search")}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if(activeTab !== "search") setActiveTab("search");
              }}
              className="bg-transparent text-sm w-full outline-none placeholder:text-slate-400 h-6"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 text-[11px] font-bold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Database เชื่อมต่อแล้ว
            </div>
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div id="content-viewport" className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                id="system-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
                  message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : 
                  message.type === "info" ? "bg-blue-50 border-blue-100 text-blue-800" : 
                  "bg-rose-50 border-rose-100 text-rose-800"
                }`}
              >
                {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : 
                 message.type === "info" ? <Bell className="w-5 h-5 animate-bounce" /> :
                 <AlertCircle className="w-5 h-5" />}
                <span className="font-bold text-sm">{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Section */}
          <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
             <SummaryCard id="stat-total" title="กำลังพลทั้งหมด" value={personnel.length} unit="นาย" />
             <SummaryCard id="stat-plans" title="แผนงานเดือนนี้" value={monthPlansCount} unit="โครงการ" />
             <div className="lg:col-span-2">
                <DashboardUpcomingTasks plans={yearPlans} />
             </div>
          </div>

          {/* Dynamic Content */}
          <div id="dynamic-content" className="min-h-0 flex-1">
            <AnimatePresence mode="wait">
              {loading ? (
                <div id="loading-spinner" className="flex flex-col justify-center items-center h-64 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">กำลังโหลดข้อมูลจากฐานข้อมูล...</p>
                </div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeTab === "dashboard" && (
                    <div className="space-y-8">
                      <CalendarDashboard plans={yearPlans} bookings={bookingLogs} personnel={personnel} />
                      
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> ประวัติการใช้รายชื่อล่าสุด (ทักษะหน่วยงานคุณ)
                          </h2>
                          <div className="text-[10px] bg-white px-3 py-1 rounded-full border border-slate-200 font-bold text-slate-400">
                            10 รายการล่าสุด
                          </div>
                        </div>
                        <RecentBookings 
                          bookings={bookingLogs} 
                          personnel={personnel} 
                          plans={yearPlans} 
                          userDivision={userDivision!}
                          onCancelBooking={handleCancelBooking}
                        />
                      </div>
                    </div>
                  )}
                  {activeTab === "yearPlan" && (
                    <YearPlanModule 
                      plans={yearPlans} 
                      userDivision={userDivision!}
                      refresh={fetchData} 
                      showMessage={showMessage} 
                      onDeletePlan={handleDeleteYearPlan}
                    />
                  )}
                  {activeTab === "booking" && (
                    <BookingModule 
                      personnel={personnel} 
                      plans={yearPlans} 
                      bookings={bookingLogs} 
                      duty={dutyRoster}
                      userDivision={userDivision!}
                      refresh={fetchData} 
                      showMessage={showMessage} 
                      onCancelBooking={handleCancelBooking}
                    />
                  )}
                  {activeTab === "duty" && (
                    <DutyModule 
                      personnel={personnel}
                      duty={dutyRoster}
                      bookings={bookingLogs}
                      plans={yearPlans}
                      userDivision={userDivision!}
                      refresh={fetchData}
                      showMessage={showMessage}
                    />
                  )}
                  {activeTab === "search" && (
                    <SearchModule 
                      personnel={personnel} 
                      bookings={bookingLogs} 
                      duty={dutyRoster} 
                      plans={yearPlans}
                      userDivision={userDivision!}
                      refresh={fetchData}
                      showMessage={showMessage}
                      searchTerm={globalSearch}
                      onSearchChange={setGlobalSearch}
                      onCancelBooking={handleCancelBooking}
                      onDeletePersonnel={handleDeletePersonnel}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ active, onClick, icon, label, id }: { active: boolean, onClick: () => void, icon: any, label: string, id?: string }) {
  return (
    <button 
      id={id}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-3 transition-all cursor-pointer group ${
        active 
          ? "bg-blue-600/10 text-blue-400 border-r-4 border-blue-600 font-bold" 
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      }`}
    >
      <div className={`transition-opacity ${active ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}>{icon}</div>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function SummaryCard({ title, value, unit, color = "text-slate-900", id }: { title: string, value: number, unit: string, color?: string, id?: string }) {
  return (
    <div id={id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-2 group-hover:text-blue-500 transition-colors">{title}</p>
      <h3 className={`text-2xl font-black tracking-tight ${color}`}>
        {value.toLocaleString()} <span className="text-sm font-normal text-slate-400">{unit}</span>
      </h3>
    </div>
  );
}

function DashboardUpcomingTasks({ plans }: { plans: YearPlan[] }) {
  const today = new Date().toLocaleDateString('en-CA');
  const upcoming = Array.isArray(plans) ? plans
    .filter(p => p.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 2) : [];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col justify-center">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">วาระงานที่กำลังจะมาถึง</p>
        <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Next Up</span>
      </div>
      <div className="flex flex-col gap-3 min-w-0 flex-1">
        {upcoming.length === 0 ? (
          <p className="text-xs text-slate-300 italic py-2">ไม่มีวาระงานที่กำลังจะมาถึง</p>
        ) : (
          upcoming.map(p => (
            <div key={p.id} className="flex flex-col gap-1 border-l-2 border-blue-500 pl-3 min-w-0">
              <p className="text-xs font-black text-slate-800 truncate leading-tight">{p.title}</p>
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">{formatShortDateThai(p.startDate)}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full shrink-0"></span>
                <span className="text-[9px] text-blue-600 font-bold truncate">📍 {p.location}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full shrink-0"></span>
                <span className="text-[9px] text-slate-400 font-bold truncate shrink-0">{p.division.split('. ')[1] || p.division}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function YearPlanTable({ plans, divisionOnly, onEdit, onDelete }: { plans: YearPlan[], divisionOnly?: string, onEdit?: (plan: YearPlan) => void, onDelete?: (id: string) => void }) {
  const filteredPlans = divisionOnly ? plans.filter(p => p.division === divisionOnly) : plans;
  
  return (
    <table className="w-full text-left text-sm border-collapse">
      <thead className="text-[11px] uppercase text-slate-400 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
        <tr>
          <th className="py-4 px-6 font-bold tracking-wider">วันที่</th>
          <th className="py-4 px-6 font-bold tracking-wider">หน่วยงานเจ้าภาพ</th>
          <th className="py-4 px-6 font-bold tracking-wider">วาระงาน / โครงการ</th>
          <th className="py-4 px-6 font-bold tracking-wider text-center">รูปแบบ</th>
          {(onEdit || onDelete) && <th className="py-4 px-6 font-bold tracking-wider text-right">เครื่องมือ</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {filteredPlans.length === 0 ? (
          <tr>
            <td colSpan={5} className="py-20 text-center text-slate-300 italic">
              ไม่มีข้อมูลแผนปฏิบัติการ
            </td>
          </tr>
        ) : (
          filteredPlans.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
              <td className="py-4 px-6">
                <div className="flex flex-col">
                  <span className="text-slate-700 font-bold text-[11px]">{formatShortDateThai(p.startDate)}</span>
                  <span className="text-slate-400 text-[10px]">ถึง {formatShortDateThai(p.endDate)}</span>
                </div>
              </td>
              <td className="py-4 px-6 font-bold text-slate-700 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  {p.division.split(". ")[1] ?? p.division}
                </span>
              </td>
              <td className="py-4 px-6 text-slate-600 group-hover:text-blue-600 transition-colors font-medium">
                <span>{p.title}</span>
              </td>
              <td className="py-4 px-6 text-center">
                <span className={`px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-tight shadow-sm border ${p.type === "จัดจริง" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-700 border-slate-100"}`}>
                  {p.type}
                </span>
              </td>
              {(onEdit || onDelete) && (
                <td className="py-4 px-6 text-right">
                  <div className="flex gap-2 justify-end">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="แก้ไขรายละเอียด"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => {
                          if (!p.id) {
                            showMessage("error", "ไม่พบ ID ของแผนงานนี้ (อาจเป็นข้อมูลเก่า) ไม่สามารถยกเลิกได้");
                            return;
                          }
                          console.log("Cancelling plan with ID:", p.id);
                          if (window.confirm(`คุณต้องการยกเลิกแผนงาน "${p.title}" ใช่หรือไม่?\n(ข้อมูลจะถูกลบออกจากฐานข้อมูล)`)) {
                            onDelete(p.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                        title="ยกเลิกแผนงาน"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function RecentBookings({ bookings, personnel, plans, userDivision, onCancelBooking }: { bookings: BookingLog[], personnel: Personnel[], plans: YearPlan[], userDivision?: string, onCancelBooking?: (id: string, name: string) => void }) {
  const filteredBookings = userDivision 
    ? bookings.filter(b => plans.find(p => p.id === b.eventId)?.division === userDivision)
    : bookings;

  return (
    <div className="divide-y divide-slate-50">
      {filteredBookings.slice(-10).reverse().map(b => {
        const p = personnel.find(per => per.id === b.personnelId);
        const e = plans.find(ev => ev.id === b.eventId);
        const canCancel = userDivision && e?.division === userDivision;

        return (
          <div key={b.id} className="p-4 hover:bg-slate-50 flex items-center justify-between group transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-bold text-[10px] ring-2 ring-slate-50 group-hover:ring-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                {p?.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight mb-0.5">{p?.name}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                   <Calendar className="w-2.5 h-2.5" /> {e?.title}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right flex flex-col items-end">
                      <p className="text-[9px] text-slate-400 font-mono mb-1">
                        {new Date(b.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </p>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        ยืนยันการใช้ชื่อ
                      </span>
                    </div>
              {canCancel && onCancelBooking && (
                <button 
                  onClick={() => onCancelBooking(b.id, p?.name || "กำลังพลท่านนี้")}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-rose-100"
                  title="ยกเลิกการจัดสรร"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
      {bookings.length === 0 && (
        <div className="p-12 text-center text-slate-300 italic text-sm">
          ยังไม่พบประวัติการจัดสรรรายชื่อเพื่อเบิกงบประมาณ
        </div>
      )}
    </div>
  );
}

function YearPlanModule({ plans, userDivision, refresh, showMessage, onDeletePlan }: { plans: YearPlan[], userDivision: string, refresh: () => void, showMessage: any, onDeletePlan?: (id: string) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<YearPlan>>({
    division: userDivision,
    type: "จัดจริง",
    title: "",
    startDate: "",
    endDate: "",
    location: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.location) {
      return showMessage("error", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // Check for date conflicts within the same division (excluding the plan being edited)
    const conflict = plans.find(p => 
      p.id !== editingId &&
      p.division === formData.division && 
      formData.startDate! <= p.endDate && 
      p.startDate <= formData.endDate!
    );

    if (conflict) {
      return showMessage("error", `ห้วงเวลาทับซ้อนกับแผนงานที่มีอยู่: ${conflict.title} (${conflict.startDate} ถึง ${conflict.endDate})`);
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.updateYearPlan(editingId, formData);
        showMessage("success", "แก้ไขแผนงานเรียบร้อยแล้ว");
      } else {
        await api.addYearPlan(formData);
        showMessage("success", "บันทึกแผนงานเรียบร้อยแล้ว");
      }
      setFormData({ division: userDivision, type: "จัดจริง", title: "", startDate: "", endDate: "", location: "" });
      setEditingId(null);
      refresh();
    } catch (err: any) {
      showMessage("error", err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plan: YearPlan) => {
    setEditingId(plan.id);
    setFormData({
      division: plan.division,
      type: plan.type,
      title: plan.title,
      startDate: plan.startDate,
      endDate: plan.endDate,
      location: plan.location
    });
    // Scroll form into view if on mobile
    window.scrollTo({ top: document.getElementById('add-plan-card')?.offsetTop || 0, behavior: 'smooth' });
  };

  return (
    <div id="year-plan-module" className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-sm text-slate-700 uppercase tracking-widest">การจัดการแผนวาระงาน ({userDivision})</h2>
            <div className="flex bg-slate-200 p-0.5 rounded-lg">
               <button className="px-3 py-1 bg-white text-slate-800 text-[10px] font-bold rounded-md shadow-sm uppercase tracking-wider">รายการของฉัน</button>
            </div>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          <YearPlanTable plans={plans} divisionOnly={userDivision} onEdit={handleEdit} onDelete={onDeletePlan} />
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div id="add-plan-card" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
            {editingId ? <Filter className="w-5 h-5 text-blue-600 rotate-180" /> : <Plus className="w-5 h-5 text-blue-600" />} 
            {editingId ? "แก้ไขวาระงาน" : "เพิ่มวาระงานใหม่"}
          </h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">กองงานรับผิดชอบ</label>
              <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-600">
                {userDivision}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">ชื่อวาระงาน / โครงการ</label>
              <input 
                type="text" 
                placeholder="ระบุชื่องาน..."
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">วันที่เริ่ม</label>
                 <input 
                   type="date"
                   value={formData.startDate}
                   onChange={e => setFormData({...formData, startDate: e.target.value})}
                   className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none font-mono font-bold"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">วันที่สิ้นสุด</label>
                 <input 
                   type="date"
                   value={formData.endDate}
                   onChange={e => setFormData({...formData, endDate: e.target.value})}
                   className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none font-mono font-bold"
                 />
               </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">สถานที่จัดงาน</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="อาคาร / ห้องปฏิบัติการ..."
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>
            {/* รูปแบบการจัด */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">รูปแบบการจัด</label>
              <div className="grid grid-cols-2 gap-3">
                 <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: "จัดจริง"})}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${formData.type === "จัดจริง" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300"}`}
                 >
                   จัดงานจริง
                 </button>
                 <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: "บริหาร"})}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${formData.type === "บริหาร" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300"}`}
                 >
                   บริหารเชิงธุรการ
                 </button>
              </div>
            </div>
            <div className="flex gap-3">
              {editingId && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ division: userDivision, type: "จัดจริง", title: "", startDate: "", endDate: "", location: "" });
                  }}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest mt-2"
                >
                  ยกเลิก
                </button>
              )}
              <button 
                disabled={submitting}
                className={`flex-[2] py-3 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-900 transition-all uppercase text-[10px] tracking-widest mt-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มแผนงาน"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden group">
           <div className="relative z-10">
             <h3 className="font-black text-lg mb-1 italic">Authorized Only</h3>
             <p className="text-[11px] leading-relaxed text-blue-100 opacity-90">
               คุณสามารถ <strong>แก้ไข</strong> และ <strong>ยกเลิก</strong> แผนงานเฉพาะที่หน่วยงานของคุณเป็นเจ้าภาพเท่านั้น ข้อมูลจะถูก Update ลงฐานข้อมูลแบบ Real-time
             </p>
           </div>
           <Building2 className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
}

function BookingModule({ personnel, plans, bookings, duty, userDivision, refresh, showMessage, onCancelBooking }: { personnel: Personnel[], plans: YearPlan[], bookings: BookingLog[], duty: DutyRoster[], userDivision: string, refresh: () => void, showMessage: any, onCancelBooking?: (id: string, name: string) => void }) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedEventId, setSelectedEventId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const selectedEvent = plans.find(p => p.id === selectedEventId);
  
  const isOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
    return start1 <= end2 && start2 <= end1;
  };

  const personnelWithStatus = Array.isArray(personnel) ? personnel.map(p => {
    // Check if on duty or leave on any day within the month (General info)
    const hasAnyDutyThisMonth = Array.isArray(duty) && duty.some(d => d.monthYear.startsWith(currentMonth) && d.personnelId === p.id && (d.status === "เข้าเวร" || d.status.includes("ลา")));
    
    // Specific conflict checks
    let hasConflict = false;
    let conflictTitle = "";
    let conflictType: "booking" | "duty" | "duplicate" = "booking";
    
    if (selectedEvent) {
      // 1. Check if already booked for THIS specific event
      const alreadyInThisEvent = Array.isArray(bookings) && bookings.some(b => b.personnelId === p.id && b.eventId === selectedEventId);
      if (alreadyInThisEvent) {
        hasConflict = true;
        conflictTitle = "จัดสรรในโครงการนี้แล้ว";
        conflictType = "duplicate";
      }

      // 2. Check overlap with other bookings
      if (!hasConflict) {
        const pBookings = Array.isArray(bookings) ? bookings.filter(b => b.personnelId === p.id && b.eventId !== selectedEventId) : [];
        for (const b of pBookings) {
          const bookedEvent = plans.find(ev => ev.id === b.eventId);
          if (bookedEvent && isOverlapping(selectedEvent.startDate, selectedEvent.endDate, bookedEvent.startDate, bookedEvent.endDate)) {
            hasConflict = true;
            conflictTitle = `ซ้ำซ้อนกับ: ${bookedEvent.title}`;
            conflictType = "booking";
            break;
          }
        }
      }

      // 3. Check overlap with Duty/Leave dates (Critical)
      if (!hasConflict) {
        const pDuties = Array.isArray(duty) ? duty.filter(d => d.personnelId === p.id && (d.status === "เข้าเวร" || d.status.includes("ลา"))) : [];
        for (const d of pDuties) {
          const dutyDate = d.monthYear;
          // Check if dutyDate overlaps with event range
          if (dutyDate && dutyDate >= selectedEvent.startDate && dutyDate <= selectedEvent.endDate) {
            hasConflict = true;
            conflictTitle = `ติด: ${d.status}`;
            conflictType = "duty";
            break;
          }
        }
      }
    }

    return { ...p, isOnDuty: hasAnyDutyThisMonth, hasConflict, conflictTitle, conflictType };
  }) : [];

  const availablePersonnel = personnelWithStatus.filter(p => {
    const matchesSearch = p.name.includes(searchTerm) || (p.affiliation && p.affiliation.includes(searchTerm)) || p.division.includes(searchTerm);
    return matchesSearch;
  });

  const handleSubmit = async (personId: string) => {
    if (!selectedEventId) return showMessage("error", "กรุณาเลือกวาระงานโครงการก่อนจัดสรรรายชื่อ");
    
    const p = personnelWithStatus.find(pers => pers.id === personId);
    if (p?.hasConflict) return showMessage("error", `บุคคลนี้ไม่สามารถจัดสรรได้: ${p.conflictTitle}`);

    try {
      await api.addBooking({ monthYear: currentMonth, eventId: selectedEventId, personnelId: personId });
      showMessage("success", "จัดสรรรายชื่อสำเร็จ บันทึกข้อมูลแล้ว");
      refresh();
    } catch (err: any) {
      showMessage("error", err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const divisionPlans = plans.filter(p => p.division === userDivision);

  return (
    <div id="booking-module" className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
      <section id="personnel-selection" className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full min-h-[600px]">
         <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="font-bold text-sm text-slate-800 uppercase tracking-widest">เลือกกำลังพลจัดสรร</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{formatMonthYearThai(currentMonth)} - คงเหลือ {availablePersonnel.length} นาย</p>
               </div>
            </div>
            <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="ค้นชื่อ หรือ กองงาน..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
               />
            </div>
         </div>
         
         <div className="p-0 flex-1 overflow-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
               {availablePersonnel.length === 0 ? (
                 <div className="col-span-2 py-32 text-center bg-white">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm text-slate-400 italic">ไม่พบรายชื่อกำลังพลที่ว่างสำหรับการจัดสรรในขณะนี้</p>
                 </div>
               ) : (
                 availablePersonnel.map(p => (
                  <div key={p.id} className={`p-4 transition-all flex justify-between items-center group border-b border-slate-50 ${p.isOnDuty || p.hasConflict ? "bg-slate-50" : "bg-white hover:bg-blue-50/50"}`}>
                    <div className="flex items-center gap-3 min-w-0">
                       <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0 border ${p.isOnDuty ? "bg-rose-50 border-rose-200 text-rose-500" : p.hasConflict ? "bg-orange-50 border-orange-200 text-orange-500" : "bg-slate-50 border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200"}`}>
                          {p.name.charAt(0)}
                       </div>
                       <div className="min-w-0">
                          <p className={`text-xs font-bold truncate mb-0.5 ${p.hasConflict ? "text-orange-600" : p.isOnDuty ? "text-rose-500" : "text-slate-700"}`}>{p.rank ? `${p.rank} ` : ''}{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate italic">{p.affiliation || p.division}</p>
                          {p.hasConflict && <p className="text-[9px] text-orange-600 font-extrabold uppercase tracking-tighter flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> {p.conflictTitle}</p>}
                          {!p.hasConflict && p.isOnDuty && <p className="text-[9px] text-rose-400 font-bold uppercase tracking-tighter italic">ติดเวรวันอื่นในเดือนนี้</p>}
                       </div>
                    </div>
                    <button 
                      onClick={() => handleSubmit(p.id)}
                      disabled={!selectedEventId || p.hasConflict}
                      className={`text-[10px] font-black uppercase px-3 py-1.5 rounded transition-all shadow-sm ${!selectedEventId || p.hasConflict ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"}`}
                    >
                      {p.hasConflict ? "ไม่ว่าง" : "จองชื่อ"}
                    </button>
                  </div>
                 ))
               )}
            </div>
         </div>
      </section>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <div id="booking-config" className="bg-[#0f172a] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
           <div className="relative z-10 space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                <h3 className="font-extrabold text-lg uppercase tracking-wider">ตั้งค่าการจัดสรร (Allocation)</h3>
             </div>
             
             <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-[0.2em]">วาระงานเป้าหมาย ({userDivision})</label>
                <div className="relative">
                  <select 
                    value={selectedEventId}
                    onChange={e => setSelectedEventId(e.target.value)}
                    className="w-full p-4 border border-slate-700 rounded-2xl text-sm bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer pr-10"
                  >
                    <option value="" disabled className="text-slate-500">--- เลือกวาระงานของคุณ ---</option>
                    {divisionPlans.map(p => <option key={p.id} value={p.id} className="bg-slate-800">{p.title} ({p.startDate})</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90 pointer-events-none" />
                </div>
             </div>

             <div className="pt-2 border-t border-slate-700 space-y-3">
                <div className="flex items-start gap-3">
                   <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                   <p className="text-[10px] leading-relaxed text-slate-400">เงื่อนไขเบิกงบ: <strong>1 คน ต่อ 1 วาระงาน</strong> (สามารถไปได้หลายภารกิจในเดือนเดียวกัน หากวันไม่ซ้ำซ้อน)</p>
                </div>
                <div className="flex items-start gap-3">
                   <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500 shrink-0"></div>
                   <p className="text-[10px] leading-relaxed text-slate-400">ระบบจะตรวจสอบ <strong>วันลา และ วันเข้าเวร</strong> ของบุคคลนั้นโดยละเอียดก่อนการจอง</p>
                </div>
             </div>
           </div>
           
           <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
           <div className="absolute top-1/2 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
        </div>

        <div id="booking-history" className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden min-h-[450px]">
           <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1">
             <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-slate-700 uppercase tracking-widest flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {selectedEventId ? "รายชื่อที่จองในโครงการนี้" : "รายการจัดสรรสำเร็จ (เดือนนี้)"}
                </h2>
                {selectedEventId && (
                   <div className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded shadow-sm">
                      รวม {bookings.filter(b => b.eventId === selectedEventId).length} นาย
                   </div>
                )}
             </div>
             {selectedEvent && (
                <p className="text-[10px] text-blue-600 font-bold truncate uppercase">{selectedEvent.title}</p>
             )}
             {!selectedEvent && (
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatMonthYearThai(currentMonth)}</span>
             )}
           </div>

           {selectedEventId && (
             <div className="bg-slate-50 p-3 border-b border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">สรุปยอดตามกองงาน (Division Summary)</p>
                <div className="flex flex-wrap gap-1.5">
                   {DIVISIONS.map(div => {
                      const count = bookings.filter(b => b.eventId === selectedEventId && personnel.find(p => p.id === b.personnelId)?.division === div).length;
                      if (count === 0) return null;
                      return (
                        <div key={div} className="bg-white border border-slate-200 rounded px-2 py-1 flex items-center gap-2 shadow-sm">
                           <span className="text-[9px] font-bold text-slate-600">{div.split('. ')[1] || div}</span>
                           <span className="text-[10px] font-black text-blue-600">{count}</span>
                        </div>
                      );
                   })}
                </div>
             </div>
           )}

           <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
             <div className="divide-y divide-slate-50">
                {bookings
                  .filter(b => selectedEventId ? b.eventId === selectedEventId : b.monthYear === currentMonth)
                  .slice().reverse().map(b => {
                  const p = personnel.find(per => per.id === b.personnelId);
                  const e = plans.find(ev => ev.id === b.eventId);
                  // Only allow cancelling if it's for the current division's plan
                  const canCancel = e?.division === userDivision;
                  
                  return (
                    <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                           <p className="text-xs font-extrabold text-slate-800 truncate leading-tight">{p?.name || "ไม่ทราบชื่อ"}</p>
                        </div>
                        <p className="text-[9px] text-slate-400 ml-3.5 mt-0.5 truncate">{p?.division}</p>
                        {!selectedEventId && <p className="text-[9px] text-blue-600 font-bold truncate opacity-80 uppercase ml-3.5">{e?.title}</p>}
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <div className="flex flex-col items-end gap-1 font-mono text-[8px] text-slate-400">
                           <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-black uppercase text-[7px] tracking-tighter">Verified</span>
                           <span>{new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {canCancel && onCancelBooking && (
                          <button 
                            onClick={() => onCancelBooking(b.id, p?.name || "กำลังพลท่านนี้")}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all shadow-sm border border-rose-100"
                            title="ยกเลิกการจัดสรร"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
             </div>
             {bookings.filter(b => selectedEventId ? b.eventId === selectedEventId : b.monthYear === currentMonth).length === 0 && (
                <div className="p-12 text-center text-slate-300 italic text-xs">
                   {selectedEventId ? "ยังไม่มีการจองรายชื่อในโครงการนี้" : "ไม่มีประวัติการเบิกจ่ายสำหรับเดือนนี้"}
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

function DutyModule({ personnel, duty, bookings, plans, userDivision, refresh, showMessage }: { personnel: Personnel[], duty: DutyRoster[], bookings: BookingLog[], plans: YearPlan[], userDivision: string, refresh: () => void, showMessage: any }) {
  const [selectedPersonnel, setSelectedPersonnel] = useState("");
  const [status, setStatus] = useState("เข้าเวร");
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [originalDate, setOriginalDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [dutyType, setDutyType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const myPersonnel = Array.isArray(personnel) ? personnel.filter(p => p.affiliation === userDivision) : [];
  const myDuty = Array.isArray(duty) ? duty.filter(d => myPersonnel.some(p => p.id === d.personnelId)) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonnel) return showMessage("error", "กรุณาเลือกรายชื่อ");
    
    // Check if person has any booking on this date
    const hasBookingConflict = Array.isArray(bookings) && bookings.some(b => {
      if (b.personnelId !== selectedPersonnel) return false;
      const p = plans.find(plan => plan.id === b.eventId);
      return p && selectedDate >= p.startDate && selectedDate <= p.endDate;
    });

    if (hasBookingConflict) {
      const conflict = bookings.find(b => {
        if (b.personnelId !== selectedPersonnel) return false;
        const p = plans.find(plan => plan.id === b.eventId);
        return p && selectedDate >= p.startDate && selectedDate <= p.endDate;
      });
      const conflictTitle = plans.find(p => p.id === conflict?.eventId)?.title;
      return showMessage("error", `ไม่สามารถลงเวรได้เนื่องจากติดภารกิจ: ${conflictTitle}`);
    }

    let finalStatus = status;
    if (status === "เข้าเวร") {
      finalStatus = `เข้าเวร${dutyType ? `: ${dutyType}` : ''}`;
    } else if (status === "เปลี่ยนเวรแล้ว") {
      finalStatus = `เปลี่ยนเวร (จาก ${formatShortDateThai(originalDate)} มาเป็น ${formatShortDateThai(selectedDate)})`;
    }

    setSubmitting(true);
    try {
      // If it's a duty change, try to find and remove the old record first
      if (status === "เปลี่ยนเวรแล้ว") {
        const oldDuty = Array.isArray(duty) ? duty.find(d => 
          d.personnelId === selectedPersonnel && d.monthYear === originalDate
        ) : null;
        if (oldDuty) {
          await api.deleteDutyRoster(oldDuty.id);
        }
      }

      await api.addDutyRoster({ 
        personnelId: selectedPersonnel, 
        monthYear: selectedDate, // Use the full date here for the single column requested
        status: finalStatus,
      });
      showMessage("success", status === "เปลี่ยนเวรแล้ว" ? "เปลี่ยนเวรเรียบร้อยแล้ว (ลบข้อมูลเดิมและบันทึกใหม่)" : "บันทึกข้อมูลเรียบร้อยแล้ว");
      setSelectedPersonnel("");
      setDutyType("");
      refresh();
    } catch (err: any) {
      showMessage("error", err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" /> การจัดการเวรและการลา ({userDivision})
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">เลือกกำลังพลในสังกัด</label>
            <select 
              value={selectedPersonnel}
              onChange={e => setSelectedPersonnel(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">--- ค้นหารายชื่อ ---</option>
              {myPersonnel.map(p => <option key={p.id} value={p.id}>{p.rank ? `${p.rank} ` : ''}{p.name}</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">ประเภทรายการ</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="เข้าเวร">เข้าเวร</option>
                <option value="เปลี่ยนเวรแล้ว">เปลี่ยนเวรแล้ว</option>
                <option value="ลาพัก/อื่นๆ">ลาพัก/อื่นๆ</option>
              </select>
            </div>

            {status === "เปลี่ยนเวรแล้ว" ? (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">จากวันที่เดิม</label>
                <input 
                  type="date"
                  value={originalDate}
                  onChange={e => setOriginalDate(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            ) : status === "เข้าเวร" ? (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">ระบุประเภทเวร</label>
                <input 
                  type="text"
                  placeholder="เช่น เวรผู้ใหญ่, เวรสิบตรีน้อย..."
                  value={dutyType}
                  onChange={e => setDutyType(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
              {status === "เปลี่ยนเวรแล้ว" ? "เปลี่ยนมาเป็นวันที่" : "วันที่ปฏิบัติหน้าที่ / วันลา"}
            </label>
            <input 
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button 
            disabled={submitting}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest"
          >
            {submitting ? "กำลังบันทึก..." : "ยืนยันการบันทึกสถานะ"}
          </button>
        </form>
      </div>


      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">รายการเวรภายในหน่วย ({userDivision})</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {myDuty.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs italic">ไม่มีข้อมูลการปฏิบัติเวรในหน่วยของคุณ</div>
          ) : (
            myDuty.map(d => {
              const p = personnel.find(pers => pers.id === d.personnelId);
              return (
                <div key={d.id} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">{p?.name.charAt(0)}</div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{p?.rank ? `${p.rank} ` : ''}{p?.name}</p>
                      <p className="text-[10px] text-slate-400">{p?.affiliation || p?.division} • <span className="font-bold">{formatShortDateThai(d.monthYear)}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${d.status.includes("เข้าเวร") ? "bg-rose-50 text-rose-600" : d.status.includes("ลา") ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>{d.status}</span>
                    <button 
                      onClick={async () => {
                        if (window.confirm(`คุณต้องการลบข้อมูลสถานะของ ${p?.name} ใช่หรือไม่?`)) {
                          try {
                            await api.deleteDutyRoster(d.id);
                            showMessage("success", "ลบข้อมูลเวรเรียบร้อยแล้ว");
                            refresh();
                          } catch (err: any) {
                            showMessage("error", "ไม่สามารถลบได้: " + err.message);
                          }
                        }
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarDashboard({ plans, bookings, personnel }: { plans: YearPlan[], bookings: BookingLog[], personnel: Personnel[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPlan, setSelectedPlan] = useState<YearPlan | null>(null);

  const handleExportToExcel = (plan: YearPlan) => {
    const relevantPersonnel = bookings
      .filter(b => b.eventId === plan.id)
      .map(b => personnel.find(p => p.id === b.personnelId))
      .filter(Boolean) as Personnel[];
    
    if (relevantPersonnel.length === 0) {
      alert("ไม่พบรายชื่อที่จัดสรรในแผนงานนี้");
      return;
    }

    const wb = XLSX.utils.book_new();
    const data = [
      [plan.title],
      ["ลำดับ", "ชื่อ-นามสกุล", "ตำแหน่ง"],
      ...relevantPersonnel.map((p, index) => [
        index + 1,
        `${p.rank ? p.rank + ' ' : ''}${p.name}`,
        p.affiliation || p.division
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{wch: 10}, {wch: 35}, {wch: 25}];
    XLSX.utils.book_append_sheet(wb, ws, "รายชื่อ");
    XLSX.writeFile(wb, `รายชื่อ_${plan.title}.xlsx`);
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthName = new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(currentDate);
  const thaiYear = year + 543;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

  const getPlansForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return plans.filter(p => p.startDate <= dateStr && p.endDate >= dateStr);
  };

  const getBookedPersonnel = (eventId: string) => {
    const relevantBookings = bookings.filter(b => b.eventId === eventId);
    return relevantBookings.map(b => personnel.find(p => p.id === b.personnelId)).filter(Boolean) as Personnel[];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 leading-none">ปฏิทินแผนปฏิบัติการ</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              ประจำเดือน {formatMonthYearThai(currentDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[10px] font-black uppercase bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all">วันนี้</button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
          {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((d, index) => (
            <div key={d} className={`py-3 text-center text-[11px] font-black uppercase tracking-widest ${index === 0 ? 'text-rose-500' : index === 6 ? 'text-blue-500' : 'text-slate-400'}`}>
              {d}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto custom-scrollbar">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} className="border-b border-r border-slate-50 min-h-[120px]"></div>;
            const dayPlans = getPlansForDate(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            return (
              <div key={day} className={`border-b border-r border-slate-50 min-h-[120px] p-2 hover:bg-slate-50 transition-colors flex flex-col gap-1 relative ${isToday ? 'bg-blue-50/30' : ''}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold ${isToday ? 'bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]' : (idx % 7 === 0 ? 'text-rose-500' : idx % 7 === 6 ? 'text-blue-500' : 'text-slate-700')}`}>
                    {day}
                  </span>
                  {dayPlans.length > 0 && <span className="text-[9px] font-black text-blue-400 group-hover:text-blue-600 transition-colors">{dayPlans.length} รายการ</span>}
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayPlans.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedPlan(p)}
                      className={`px-1.5 py-1 rounded text-[9px] font-bold truncate border shadow-sm flex flex-col leading-tight cursor-pointer transition-all transform hover:scale-[1.02] active:scale-95 ${
                        p.type === 'จัดจริง' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                      }`}
                      title={`${p.title} (${p.division})\nสถานที่: ${p.location}\nห้วง: ${formatShortDateThai(p.startDate)} - ${formatShortDateThai(p.endDate)}`}
                    >
                      <span className="opacity-70 text-[7px] uppercase truncate">{p.division.split('. ')[1] || p.division}</span>
                      <span className="truncate">{p.title}</span>
                      <span className="text-[7px] opacity-60 truncate mt-0.5 whitespace-nowrap">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${p.type === 'จัดจริง' ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
                        {p.location}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-6 justify-center">
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-200 shadow-sm"></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">จัดกิจกรรมจริง</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-400 border border-indigo-200 shadow-sm"></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">บริหารงบประมาณ</span>
           </div>
        </div>

        {/* Detail Modal Overlay */}
        <AnimatePresence>
          {selectedPlan && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
              onClick={() => setSelectedPlan(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
                onClick={e => e.stopPropagation()}
              >
                <div className={`p-6 ${selectedPlan.type === 'จัดจริง' ? 'bg-emerald-600' : 'bg-indigo-600'} text-white relative`}>
                  <button 
                    onClick={() => setSelectedPlan(null)}
                    className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase tracking-widest border border-white/20">
                      {selectedPlan.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-black leading-tight tracking-tight">{selectedPlan.title}</h3>
                </div>

                <div className="p-6 space-y-6 bg-white overflow-y-auto max-h-[60vh] custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">หน่วยงาน</p>
                      <div className="flex items-center gap-2">
                         <Building2 className="w-4 h-4 text-slate-400" />
                         <p className="text-xs font-bold text-slate-700">{selectedPlan.division}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">สถานที่</p>
                      <div className="flex items-center gap-2">
                         <MapPin className="w-4 h-4 text-slate-400" />
                         <p className="text-xs font-bold text-slate-700">{selectedPlan.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ห้วงเวลา</p>
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <Clock className="w-5 h-5 text-blue-500" />
                       <div className="flex items-center gap-3">
                         <p className="text-xs font-bold text-slate-700">{formatShortDateThai(selectedPlan.startDate)} - {formatShortDateThai(selectedPlan.endDate)}</p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">รายชื่อที่จัดสรร ({getBookedPersonnel(selectedPlan.id).length})</p>
                    <div className="space-y-2">
                      {getBookedPersonnel(selectedPlan.id).length > 0 ? (
                        getBookedPersonnel(selectedPlan.id).map(p => (
                          <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 transition-all">
                                {p.name.charAt(0)}
                             </div>
                             <div>
                                <p className="text-xs font-bold text-slate-700">{p.rank ? `${p.rank} ` : ''}{p.name}</p>
                                <p className="text-[9px] text-slate-400 font-medium italic">{p.affiliation || p.division}</p>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-2">
                           <Users className="w-8 h-8 text-slate-200" />
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">ยังไม่ได้จัดสรรรายชื่อ</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
                   <button 
                     onClick={() => handleExportToExcel(selectedPlan)}
                     className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                   >
                     <Download className="w-4 h-4" /> Excel
                   </button>
                   <button 
                     onClick={() => setSelectedPlan(null)}
                     className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                   >
                     ปิด
                   </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SearchModule({ 
  personnel, bookings, duty, plans, userDivision, refresh, showMessage, searchTerm, onSearchChange, onCancelBooking, onDeletePersonnel 
}: { 
  personnel: Personnel[], bookings: BookingLog[], duty: DutyRoster[], plans: YearPlan[], userDivision: string, refresh: () => void, showMessage: any, searchTerm: string, onSearchChange: (val: string) => void, onCancelBooking?: (id: string, name: string) => void, onDeletePersonnel?: (id: string, name: string) => void 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDivision, setSelectedDivision] = useState<string>(userDivision || "ทั้งหมด");
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<{ day: number, items: any[] } | null>(null);
  
  // Update selectedDivision when userDivision changes (e.g. on login)
  useEffect(() => {
    if (userDivision && selectedDivision === "ทั้งหมด") {
      setSelectedDivision(userDivision);
    }
  }, [userDivision]);

  const filtered = personnel.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDivision = selectedDivision === "ทั้งหมด" || p.division === selectedDivision;
    return matchSearch && matchDivision;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
  
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDayData = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Filter personnel in same division or affiliation
    const myPersonnel = personnel.filter(p => p.division === userDivision || p.affiliation === userDivision);
    const myPersonnelIds = myPersonnel.map(p => p.id);
    
    const dayDuties = duty.filter(d => 
      d.monthYear === dateStr && 
      myPersonnelIds.includes(d.personnelId)
    ).map(d => ({ ...d, type: 'duty', person: personnel.find(p => p.id === d.personnelId) }));

    const dayBookings = bookings.filter(b => {
      const plan = plans.find(pl => pl.id === b.eventId);
      return plan && plan.startDate <= dateStr && plan.endDate >= dateStr && myPersonnelIds.includes(b.personnelId);
    }).map(b => {
       const plan = plans.find(pl => pl.id === b.eventId);
       return { ...b, type: 'plan', person: personnel.find(p => p.id === b.personnelId), plan };
    });

    return [...dayDuties, ...dayBookings];
  };

  const getMonthNameThai = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(date);
  };

  return (
    <div id="status-calendar-search-container" className="flex flex-col gap-12 h-full">
      {/* 1. Calendar Status View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[600px] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 leading-none">ปฏิทินพิกัดกำลังพล ({userDivision})</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                {getMonthNameThai(currentDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[10px] font-black uppercase bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all">วันนี้</button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((d, index) => (
              <div key={d} className={`py-3 text-center text-[11px] font-black uppercase tracking-widest ${index === 0 ? 'text-rose-500' : index === 6 ? 'text-blue-500' : 'text-slate-400'}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto custom-scrollbar">
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="border-b border-r border-slate-50 min-h-[120px]"></div>;
              const dayItems = getDayData(day);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              
              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDayDetail({ day, items: dayItems })}
                  className={`border-b border-r border-slate-50 min-h-[120px] p-2 hover:bg-indigo-50/30 transition-all flex flex-col gap-1 cursor-pointer group ${isToday ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold ${isToday ? 'bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]' : (idx % 7 === 0 ? 'text-rose-500' : idx % 7 === 6 ? 'text-blue-500' : 'text-slate-700')}`}>
                      {day}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">{dayItems.length} คน</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayItems.slice(0, 3).map((item: any, i) => (
                      <div 
                        key={`${item.id}-${i}`}
                        className={`px-1 py-0.5 rounded text-[8px] font-bold truncate flex items-center gap-1 ${
                          item.type === 'plan' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : item.status.includes('ลา') 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        <span className="shrink-0">{item.type === 'plan' ? '📅' : item.status.includes('ลา') ? '🍂' : '👮'}</span>
                        <span className="truncate">{item.person?.name || 'Unknown'}</span>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-[7px] text-slate-400 font-black italic mt-0.5 text-center">
                        + อีก {dayItems.length - 3} คน...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-6 justify-center">
             <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-rose-200"></span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">ติดเวร</span>
             </div>
             <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-200"></span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">ลาพัก/อื่นๆ</span>
             </div>
             <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 border border-blue-200"></span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">จัดสรรโครงการ</span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Global Search and List View */}
      <div className="space-y-6">
        <div id="search-filter-bar" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-end relative overflow-hidden">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] block ml-1">ค้นหารายชื่อกำลังพล</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="ค้นหาด้วยชื่อ-นามสกุล..."
                value={searchTerm}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all"
              />
            </div>
          </div>
          <div className="w-full md:w-80 space-y-1.5 text-right">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] block">สังกัด / กองงาน</label>
              {userDivision && selectedDivision !== userDivision && (
                <button 
                  onClick={() => setSelectedDivision(userDivision)}
                  className="text-[9px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                >
                  กองงานของฉัน
                </button>
              )}
            </div>
            <div className="relative">
               <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={selectedDivision}
                  onChange={e => setSelectedDivision(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold appearance-none cursor-pointer"
                >
                  <option>ทั้งหมด</option>
                  {DIVISIONS.map(d => <option key={d}>{d}</option>)}
                </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-8 py-5">รายชื่อ (Personnel)</th>
                <th className="px-8 py-5">สังกัด / กองงาน</th>
                <th className="px-8 py-5 text-center">พิกัด/สถานะปัจจุบัน</th>
                <th className="px-8 py-5 text-right">เครื่องมือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => {
                const todayStr = new Date().toISOString().split('T')[0];
                const dutyEntry = duty.find(d => d.monthYear === todayStr && d.personnelId === p.id);
                const projectBooking = bookings.find(b => {
                  const plan = plans.find(pl => pl.id === b.eventId);
                  return plan && plan.startDate <= todayStr && plan.endDate >= todayStr && b.personnelId === p.id;
                });
                
                let statusTag;
                if (dutyEntry) {
                  statusTag = (
                    <div className="flex flex-col items-center gap-1">
                      <span className="ring-1 ring-rose-200 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">{dutyEntry.status}</span>
                    </div>
                  );
                } else if (projectBooking) {
                  statusTag = (
                    <div className="flex flex-col items-center gap-1">
                      <span className="ring-1 ring-blue-200 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">ติดภารกิจกิจกรรม</span>
                    </div>
                  );
                } else {
                  statusTag = (
                    <div className="flex flex-col items-center gap-1">
                      <span className="ring-1 ring-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">ว่าง</span>
                    </div>
                  );
                }

                return (
                  <tr 
                    key={p.id} 
                    className="hover:bg-slate-50 transition-all group cursor-pointer"
                    onClick={() => setSelectedPerson(p)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {p.name.charAt(0)}
                         </div>
                         <p className="font-extrabold text-slate-800 leading-none text-sm underline-offset-4 group-hover:underline">{p.rank ? `${p.rank} ` : ''}{p.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-500 uppercase text-[11px] tracking-wide">
                      {p.division}
                    </td>
                    <td className="px-8 py-5 text-center">
                      {statusTag}
                    </td>
                    <td className="px-8 py-5 text-right w-10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeletePersonnel) onDeletePersonnel(p.id, p.name);
                        }}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
             <div className="py-24 text-center">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-400 italic">ไม่พบข้อมูลกำลังพล</p>
             </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedDayDetail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedDayDetail(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 bg-indigo-600 text-white relative">
                <button 
                  onClick={() => setSelectedDayDetail(null)}
                  className="absolute top-8 right-8 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-2xl font-black tracking-tight">รายละเอียดพิกัดกำลังพล</h3>
                <p className="text-indigo-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-wider">
                  วันที่ {selectedDayDetail.day} {getMonthNameThai(currentDate)}
                </p>
              </div>

              <div className="p-8 space-y-4 bg-white overflow-y-auto max-h-[50vh] custom-scrollbar">
                {selectedDayDetail.items.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                     <Users className="w-12 h-12 text-slate-100" />
                     <p className="text-slate-400 font-bold italic text-sm">ไม่พบสถานะในวันนี้</p>
                  </div>
                ) : (
                  selectedDayDetail.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                         item.type === 'plan' ? 'bg-blue-50 text-blue-500' : item.status.includes('ลา') ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                       }`}>
                          {item.type === 'plan' ? <Calendar className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800">{item.person?.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{item.type === 'plan' ? `โครงการ: ${item.plan?.title}` : `สถานะ: ${item.status}`}</p>
                       </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-8 border-t border-slate-100 flex justify-end">
                <button onClick={() => setSelectedDayDetail(null)} className="px-8 py-2 bg-slate-800 text-white rounded-xl text-xs font-black uppercase">ปิด</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedPerson && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPerson(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-10 bg-slate-900 text-white relative">
                 <button 
                  onClick={() => setSelectedPerson(null)}
                  className="absolute top-10 right-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/20">
                      {selectedPerson.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="text-3xl font-black tracking-tight">{selectedPerson.rank ? `${selectedPerson.rank} ` : ''}{selectedPerson.name}</h3>
                      <p className="text-blue-400 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> {selectedPerson.division}
                      </p>
                      {selectedPerson.affiliation && <p className="text-slate-400 text-xs font-medium italic mt-1">สังกัด: {selectedPerson.affiliation}</p>}
                   </div>
                </div>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white overflow-y-auto max-h-[60vh] custom-scrollbar">
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">ประวัติการจัดสรรรายชื่อ (Bookings)</h4>
                  <div className="space-y-3">
                    {bookings.filter(b => b.personnelId === selectedPerson.id).length === 0 ? (
                      <p className="text-xs text-slate-300 italic">ไม่มีประวัติการจองตัว</p>
                    ) : (
                      bookings.filter(b => b.personnelId === selectedPerson.id).map(b => {
                        const plan = plans.find(p => p.id === b.eventId);
                        return (
                          <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-xs font-bold text-slate-700">{plan?.title}</p>
                             <div className="flex justify-between items-center mt-2">
                                <span className="text-[9px] text-slate-400">{formatShortDateThai(plan?.startDate || '')} - {formatShortDateThai(plan?.endDate || '')}</span>
                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">เบิกจ่ายแล้ว</span>
                             </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">รายการเวรและการลา (Duty History)</h4>
                  <div className="space-y-3">
                    {duty.filter(d => d.personnelId === selectedPerson.id).length === 0 ? (
                      <p className="text-xs text-slate-300 italic">ไม่มีประวัติการเข้าเวรหรือการลา</p>
                    ) : (
                      duty.filter(d => d.personnelId === selectedPerson.id).map(d => (
                        <div key={d.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                           <div>
                              <p className="text-[10px] font-bold text-slate-700">{d.status}</p>
                              <p className="text-[9px] text-slate-400">{formatDateThai(d.monthYear)}</p>
                           </div>
                           <div className={`w-2 h-2 rounded-full ${d.status.includes('ลา') ? 'bg-amber-400' : 'bg-rose-400'}`}></div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 flex justify-end bg-slate-50/50">
                 <button 
                   onClick={() => setSelectedPerson(null)}
                   className="px-10 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                 >
                   ปิดหน้าต่าง
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

