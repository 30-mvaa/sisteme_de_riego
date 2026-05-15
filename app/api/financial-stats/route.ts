import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { FinancialStats } from "@/lib/types";

export async function GET() {
  try {
    // ── Total income from payments ──
    const incomeRes = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments"
    );

    // ── Total expenses ──
    const expenseRes = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM expenses"
    );

    // ── Income by concept ──
    const incomeByConceptRes = await pool.query(
      `SELECT concept, COALESCE(SUM(amount), 0) as total
       FROM payments
       GROUP BY concept
       ORDER BY total DESC`
    );

    // ── Expenses by category ──
    const expensesByCategoryRes = await pool.query(
      `SELECT category, COALESCE(SUM(amount), 0) as total
       FROM expenses
       GROUP BY category
       ORDER BY total DESC`
    );

    // ── Monthly stats (last 12 months) ──
    const monthlyRes = await pool.query(
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

    const totalIncome = Number(incomeRes.rows[0].total);
    const totalExpenses = Number(expenseRes.rows[0].total);

    const stats: FinancialStats = {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeByConcept: incomeByConceptRes.rows.map((r) => ({
        concept: String(r.concept),
        total: Number(r.total),
      })),
      expensesByCategory: expensesByCategoryRes.rows.map((r) => ({
        category: String(r.category),
        total: Number(r.total),
      })),
      monthlyStats: monthlyRes.rows.map((r) => ({
        month: String(r.month),
        income: Number(r.income),
        expenses: Number(r.expenses),
        balance: Number(r.income) - Number(r.expenses),
      })),
    };

    return NextResponse.json(stats, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
