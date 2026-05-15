"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import type {
  Expense,
  ExpenseCategory,
  FinancialStats,
} from "@/lib/types";
import {
  EXPENSE_CATEGORY_LABELS,
  CONCEPT_LABELS,
  type PaymentConcept,
} from "@/lib/types";
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

const CONCEPT_LABELS_MAP: Record<string, string> = {
  monthly: "Cuota Mensual",
  event_fine: "Multa por Inasistencia",
  other: "Otro",
};

const CONCEPT_COLORS: Record<string, string> = {
  monthly: "bg-emerald-500/20 text-emerald-400",
  event_fine: "bg-amber-500/20 text-amber-400",
  other: "bg-blue-500/20 text-blue-400",
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  administrativo: "bg-sky-500/20 text-sky-400",
  operativo: "bg-violet-500/20 text-violet-400",
  mantenimiento: "bg-orange-500/20 text-orange-400",
  insumos: "bg-teal-500/20 text-teal-400",
  servicios: "bg-rose-500/20 text-rose-400",
  otro: "bg-gray-500/20 text-gray-400",
};

export default function FinanzasPage() {
  const { currentUser } = useApp();
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState<ExpenseCategory>("administrativo");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setFetchError(null);
    const ts = Date.now();
    const [statsRes, expensesRes] = await Promise.all([
      fetch(`/api/financial-stats?_=${ts}`),
      fetch(`/api/expenses?_=${ts}`),
    ]);
    if (!statsRes.ok) setFetchError("Error al cargar estadísticas financieras");
    if (statsRes.ok) setStats(await statsRes.json());
    if (expensesRes.ok) setExpenses(await expensesRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const amount = Number(formAmount);
    if (!formDesc.trim()) return setFormError("Descripción requerida");
    if (!amount || amount <= 0) return setFormError("Monto inválido");
    if (!formDate) return setFormError("Fecha requerida");

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: formDesc.trim(),
        category: formCategory,
        amount,
        date: formDate,
        notes: formNotes.trim() || undefined,
        createdBy: currentUser?.name,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return setFormError(err.error || "Error al guardar");
    }

    setFormDesc("");
    setFormCategory("administrativo");
    setFormAmount("");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormNotes("");
    setShowForm(false);
    fetchData();
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(n);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Análisis Financiero</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen de ingresos (cuotas, reuniones, multas) y gastos
        </p>
        {fetchError && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mt-2">
            {fetchError}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Ingresos</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {formatMoney(stats.totalIncome)}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <TrendingDown size={18} className="text-red-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Gastos</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatMoney(stats.totalExpenses)}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Wallet size={18} className="text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Saldo</span>
            </div>
            <p
              className={`text-2xl font-bold ${
                stats.balance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatMoney(stats.balance)}
            </p>
          </div>
        </div>
      )}

      {/* Income by Concept + Expenses by Category */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" />
              Ingresos por Concepto
            </h2>
            {stats.incomeByConcept.length === 0 ? (
              <p className="text-sm text-gray-400">Sin ingresos registrados</p>
            ) : (
              <div className="space-y-3">
                {stats.incomeByConcept.map((item) => (
                  <div key={item.concept}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">
                        {CONCEPT_LABELS_MAP[item.concept] || item.concept}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatMoney(item.total)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.concept === "monthly"
                            ? "bg-emerald-400"
                            : item.concept === "event_fine"
                              ? "bg-amber-400"
                              : "bg-blue-400"
                        }`}
                        style={{
                          width: `${
                            stats.totalIncome
                              ? (item.total / stats.totalIncome) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses Breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown size={16} className="text-red-500" />
              Gastos por Categoría
            </h2>
            {stats.expensesByCategory.length === 0 ? (
              <p className="text-sm text-gray-400">Sin gastos registrados</p>
            ) : (
              <div className="space-y-3">
                {stats.expensesByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">
                        {EXPENSE_CATEGORY_LABELS[item.category as ExpenseCategory] || item.category}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatMoney(item.total)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-400"
                        style={{
                          width: `${
                            stats.totalExpenses
                              ? (item.total / stats.totalExpenses) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly Chart */}
      {stats && stats.monthlyStats.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Evolución Mensual
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Mes</th>
                  <th className="text-right py-2 px-2 text-emerald-600 font-medium">Ingresos</th>
                  <th className="text-right py-2 px-2 text-red-600 font-medium">Gastos</th>
                  <th className="text-right py-2 px-2 text-blue-600 font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {stats.monthlyStats.map((m) => (
                  <tr key={m.month} className="border-b border-gray-50">
                    <td className="py-2 px-2 text-gray-700">{m.month}</td>
                    <td className="py-2 px-2 text-right text-emerald-600">
                      {formatMoney(m.income)}
                    </td>
                    <td className="py-2 px-2 text-right text-red-600">
                      {formatMoney(m.expenses)}
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      <span className={m.balance >= 0 ? "text-blue-600" : "text-red-600"}>
                        {formatMoney(m.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Gastos Registrados
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            Nuevo Gasto
          </button>
        </div>

        {/* Add Expense Form */}
        {showForm && (
          <form
            onSubmit={handleAddExpense}
            className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3"
          >
            {formError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {formError}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Ej: Compra de tuberías"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Categoría
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {(Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]).map(
                    ([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Monto (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Detalles adicionales..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar Gasto
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Expenses Table */}
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-400">No hay gastos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Fecha</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Descripción</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Categoría</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Monto</th>
                  <th className="text-center py-2 px-2 text-gray-500 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-2 text-gray-600 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-2.5 px-2 text-gray-900">
                      <p className="font-medium">{exp.description}</p>
                      {exp.notes && (
                        <p className="text-xs text-gray-400 mt-0.5">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                          CATEGORY_COLORS[exp.category as ExpenseCategory] || "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {EXPENSE_CATEGORY_LABELS[exp.category as ExpenseCategory] || exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-red-600">
                      {formatMoney(exp.amount)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
