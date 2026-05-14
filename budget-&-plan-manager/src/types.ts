export interface Personnel {
  id: string;
  name: string;
  division: string;
  affiliation: string;
  rank?: string;
}

export interface DutyRoster {
  id: string;
  personnelId: string;
  monthYear: string; // เก็บวันที่เต็ม "YYYY-MM-DD" หรือเดือน "YYYY-MM" ขึ้นอยู่กับบริบท
  status: string;
  // หมายเหตุ: ไม่มีคอลัมน์ "date" ใน Supabase — ใช้ monthYear เป็น date string ทั้งหมด
}

export interface YearPlan {
  id: string;
  title: string;
  division: string;
  startDate: string;
  endDate: string;
  location: string;
  type: "จัดจริง" | "บริหาร";
}

export interface BookingLog {
  id: string;
  personnelId: string;
  eventId: string;
  monthYear: string;
  timestamp: string;
}

export const DIVISIONS = [
  "สำนักผู้บังคับบัญชา",
  "กกล.กพ.ทหาร",
  "กบพ.กพ.ทหาร",
  "กปค.กพ.ทหาร",
  "กจก.กพ.ทหาร",
  "กพบท.กพ.ทหาร",
  "กพพ.กพ.ทหาร",
  "กนผ.สนผพ.กพ.ทหาร",
  "กทด.สนผพ.กพ.ทหาร",
  "กคง.สนผพ.กพ.ทหาร",
  "ฝกพ.ศบท."
];