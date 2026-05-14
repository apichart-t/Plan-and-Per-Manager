
/**
 * วัตถุประสงค์: จัดการรูปแบบวันที่ให้เป็นภาษาไทย ตามที่ผู้ใช้ต้องการ
 * รูปแบบหลัก: วันจันทร์ที่ 11 พฤษภาคม 2569
 */

export const formatDateThai = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return "";
  
  // กรณีที่เป็น ISO String หรือ Date object
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  
  return new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

/**
 * รูปแบบย่อ: 11 พ.ค. 2569
 */
export const formatShortDateThai = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

/**
 * รูปแบบเฉพาะชื่อเดือนและปี: พฤษภาคม 2569
 */
export const formatMonthYearThai = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
     // พยายามกรณี "2026-05"
     const parts = String(dateInput).split('-');
     if (parts.length === 2) {
       const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
       if (!isNaN(d.getTime())) {
         return new Intl.DateTimeFormat('th-TH', {
           month: 'long',
           year: 'numeric'
         }).format(d);
       }
     }
     return String(dateInput);
  }
  
  return new Intl.DateTimeFormat('th-TH', {
    month: 'long',
    year: 'numeric'
  }).format(date);
};
