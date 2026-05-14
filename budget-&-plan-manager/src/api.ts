import { createClient } from "@supabase/supabase-js";
import { Personnel, YearPlan, BookingLog, DutyRoster } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const api = {
  // ── Personnel ──────────────────────────────────────────────
  getPersonnel: async (): Promise<Personnel[]> => {
    const { data, error } = await supabase.from("personnel").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  },

  deletePersonnel: async (id: string): Promise<void> => {
    // cascade ลบ booking และ duty ก่อน
    await supabase.from("BookingLog").delete().eq("personnelId", id);
    await supabase.from("DutyRoster").delete().eq("personnelId", id);
    const { error } = await supabase.from("personnel").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // ── YearPlan ───────────────────────────────────────────────
  getYearPlan: async (): Promise<YearPlan[]> => {
    const { data, error } = await supabase.from("year_plan").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  },

  addYearPlan: async (data: Partial<YearPlan>): Promise<YearPlan> => {
    const { data: result, error } = await supabase
      .from("year_plan").insert([data]).select();
    if (error) throw new Error(error.message);
    return result![0];
  },

  updateYearPlan: async (id: string, data: Partial<YearPlan>): Promise<YearPlan> => {
    const { data: result, error } = await supabase
      .from("year_plan").update(data).eq("id", id).select();
    if (error) throw new Error(error.message);
    return result![0];
  },

  deleteYearPlan: async (id: string): Promise<void> => {
    // cascade ลบ booking ที่อ้างถึง event นี้ก่อน
    await supabase.from("BookingLog").delete().eq("eventId", id);
    const { error } = await supabase.from("year_plan").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // ── BookingLog ─────────────────────────────────────────────
  getBookingLog: async (): Promise<BookingLog[]> => {
    const { data, error } = await supabase.from("BookingLog").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  },

  addBooking: async (data: {
    monthYear: string;
    eventId: string;
    personnelId: string;
  }): Promise<BookingLog> => {
    const payload = { ...data, timestamp: new Date().toISOString() };
    const { data: result, error } = await supabase
      .from("BookingLog").insert([payload]).select();
    if (error) throw new Error(error.message);
    return result![0];
  },

  deleteBooking: async (id: string): Promise<void> => {
    const { error } = await supabase.from("BookingLog").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // ── DutyRoster ─────────────────────────────────────────────
  getDutyRoster: async (): Promise<DutyRoster[]> => {
    const { data, error } = await supabase.from("DutyRoster").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  },

  addDutyRoster: async (data: {
    personnelId: string;
    monthYear: string;
    status: string;
  }): Promise<DutyRoster> => {
    const { data: result, error } = await supabase
      .from("DutyRoster").insert([data]).select();
    if (error) throw new Error(error.message);
    return result![0];
  },

  deleteDutyRoster: async (id: string): Promise<void> => {
    const { error } = await supabase.from("DutyRoster").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};