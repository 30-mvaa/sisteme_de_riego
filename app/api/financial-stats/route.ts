import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { FinancialStats } from "@/lib/types";

export async function GET() {
  // Cada consulta se ejecuta por separado para que una falla no rompa las demás
  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeByConcept: { concept: string; total: number }[] = [];
  let expensesByCategory: { category: string; total: number }[] = [];
  let monthlyStats: { month: string; income: number; expenses: number; balance: number }[] = [];

  try {
    const r = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments");
    totalIncome = Number(r.rows[0].total);
  } catch (e) { console.error("income query error:", e); }

  try {
    const r = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM expenses");
    totalExpenses = Number(r.rows[0].total);
  } catch (e) { console.error("expenses total query error:", e); }

  try {
    const r = await pool.query(
      `SELECT concept, COALESCE(SUM(amount), 0) as total
       FROM payments GROUP BY concept ORDER BY total DESC`
    );
    incomeByConcept = r.rows.map((r) => ({ concept: String(r.concept), total: Number(r.total) }));
  } catch (e) { console.error("income by concept error:", e); }

  try {
    const r = await pool.query(
      `SELECT category, COALESCE(SUM(amount), 0) as total
       FROM expenses GROUP BY category ORDER BY total DESC`
    );
    expensesByCategory = r.rows.map((r) => ({ category: String(r.category), total: Number(r.total) }));
  } catch (e) { console.error("expenses by category error:", e); }

  try {
    const r = await pool.query(
      `WITH months AS (
         SELECT to_char(generate_series(
           date_trunc('month', now()) - interval '11 months',
           date_trunc('month', now()),
           '1 month'
         ), 'YYYY-MM') AS month
       ),
       income AS (
          SELECT to_char(date::date, 'YYYY-MM') AS month,
                 COALESCE(SUM(amount), 0) AS total
          FROM payments
          WHERE date::date >= date_trunc('month', now()) - interval '11 months'
          GROUP BY 1
        ),
        expenses AS (
          SELECT to_char(date::date, 'YYYY-MM') AS month,
                 COALESCE(SUM(amount), 0) AS total
          FROM expenses
          WHERE date::date >= date_trunc('month', now()) - interval '11 months'
          GROUP BY 1
        )
       SELECT m.month,
              COALESCE(i.total, 0) AS income,
              COALESCE(e.total, 0) AS expenses
       FROM months m
       LEFT JOIN income i ON m.month = i.month
       LEFT JOIN expenses e ON m.month = e.month
       ORDER BY m.month ASC`
    );
    monthlyStats = r.rows.map((r) => ({
      month: String(r.month),
      income: Number(r.income),
      expenses: Number(r.expenses),
      balance: Number(r.income) - Number(r.expenses),
    }));
  } catch (e) { console.error("monthly stats error:", e); }

  const stats: FinancialStats = {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    incomeByConcept,
    expensesByCategory,
    monthlyStats,
  };

  return NextResponse.json(stats, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
