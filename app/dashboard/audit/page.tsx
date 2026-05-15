"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/app-context";
import { SUPERADMIN_USERNAME } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  FileText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Eye,
  KeyRound,
  AlertTriangle,
  RefreshCw,
  Download,
  Activity,
} from "lucide-react";

interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  LOGIN: <LogIn size={14} />,
  LOGOUT: <LogOut size={14} />,
  LOGIN_FAILED: <AlertTriangle size={14} />,
  CREATE: <UserPlus size={14} />,
  UPDATE: <Edit size={14} />,
  DELETE: <Trash2 size={14} />,
  VIEW: <Eye size={14} />,
  PASSWORD_RESET_REQUEST: <KeyRound size={14} />,
  PASSWORD_RESET_COMPLETE: <RefreshCw size={14} />,
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "bg-green-100 text-green-700 border-green-200",
  LOGOUT: "bg-gray-100 text-gray-700 border-gray-200",
  LOGIN_FAILED: "bg-red-100 text-red-700 border-red-200",
  CREATE: "bg-blue-100 text-blue-700 border-blue-200",
  UPDATE: "bg-amber-100 text-amber-700 border-amber-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  VIEW: "bg-purple-100 text-purple-700 border-purple-200",
  PASSWORD_RESET_REQUEST: "bg-orange-100 text-orange-700 border-orange-200",
  PASSWORD_RESET_COMPLETE: "bg-teal-100 text-teal-700 border-teal-200",
};

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Inicio de sesión",
  LOGOUT: "Cierre de sesión",
  LOGIN_FAILED: "Inicio fallido",
  CREATE: "Creó",
  UPDATE: "Actualizó",
  DELETE: "Eliminó",
  VIEW: "Visualizó",
  PASSWORD_RESET_REQUEST: "Solicitó recuperación",
  PASSWORD_RESET_COMPLETE: "Restableció contraseña",
};

const ENTITY_LABELS: Record<string, string> = {
  user: "Usuario",
  member: "Miembro",
  payment: "Pago",
  event: "Evento",
  attendance: "Asistencia",
  monthly_charge: "Cuota mensual",
  settings: "Configuración",
};

export default function AuditPage() {
  const { currentUser, isHydrated } = useApp();
  const isSuperAdmin = currentUser?.username === SUPERADMIN_USERNAME;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    action: "all",
    entityType: "all",
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.action !== "all") params.set("action", filters.action);
      if (filters.entityType !== "all") params.set("entityType", filters.entityType);
      if (filters.search) params.set("userId", filters.search);

      const res = await fetch(`/api/audit?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated && isSuperAdmin) {
      fetchLogs();
    }
  }, [isHydrated, isSuperAdmin, pagination.page, filters.action, filters.entityType]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((p) => ({ ...p, page: newPage }));
  };

  const exportToCSV = () => {
    const headers = ["Fecha", "Usuario", "Acción", "Entidad", "ID Entidad", "IP", "Detalles"];
    const rows = logs.map((log) => [
      log.createdAt,
      log.username,
      log.action,
      log.entityType,
      log.entityId || "",
      log.ipAddress || "",
      JSON.stringify(log.details || {}),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Cargando...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <ShieldAlert size={32} className="text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">
            Acceso restringido
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Solo el administrador principal puede ver los registros de auditoría.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #dc2626, #ef4444)" }}
            >
              <Activity size={15} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Registro de Auditoría</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Historial completo de acciones realizadas en el sistema.
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download size={16} />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por usuario..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.action}
            onValueChange={(v) => setFilters((f) => ({ ...f, action: v }))}
          >
            <SelectTrigger className="w-full sm:w-48">
              <Filter size={14} className="mr-2" />
              <SelectValue placeholder="Acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las acciones</SelectItem>
              <SelectItem value="LOGIN">Inicio de sesión</SelectItem>
              <SelectItem value="LOGOUT">Cierre de sesión</SelectItem>
              <SelectItem value="LOGIN_FAILED">Inicio fallido</SelectItem>
              <SelectItem value="CREATE">Creaciones</SelectItem>
              <SelectItem value="UPDATE">Actualizaciones</SelectItem>
              <SelectItem value="DELETE">Eliminaciones</SelectItem>
              <SelectItem value="VIEW">Visualizaciones</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.entityType}
            onValueChange={(v) => setFilters((f) => ({ ...f, entityType: v }))}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Entidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las entidades</SelectItem>
              <SelectItem value="user">Usuarios</SelectItem>
              <SelectItem value="member">Miembros</SelectItem>
              <SelectItem value="payment">Pagos</SelectItem>
              <SelectItem value="event">Eventos</SelectItem>
              <SelectItem value="attendance">Asistencias</SelectItem>
              <SelectItem value="monthly_charge">Cuotas</SelectItem>
              <SelectItem value="settings">Configuración</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchLogs} className="gap-2">
            <Search size={16} />
            Buscar
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Entidad
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  IP
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                    Cargando...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <FileText size={24} className="mx-auto mb-2 opacity-50" />
                    No hay registros de auditoría.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-gray-500">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {log.username}
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={`${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700"} border gap-1`}>
                        {ACTION_ICONS[log.action]}
                        {ACTION_LABELS[log.action] || log.action}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                      {ENTITY_LABELS[log.entityType] || log.entityType}
                      {log.entityId && (
                        <span className="text-xs text-gray-400 ml-1">#{log.entityId.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs hidden lg:table-cell">
                      {log.ipAddress || "-"}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        title="Ver detalles"
                      >
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
              {pagination.total} registros
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} />
              Detalles del Registro
            </DialogTitle>
            <DialogDescription>
              Información detallada de la acción registrada.
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDate(selectedLog.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Usuario</p>
                  <p className="font-medium">{selectedLog.username}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Acción</p>
                  <Badge className={`${ACTION_COLORS[selectedLog.action]} border gap-1 mt-1`}>
                    {ACTION_ICONS[selectedLog.action]}
                    {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Entidad</p>
                  <p className="font-medium">
                    {ENTITY_LABELS[selectedLog.entityType] || selectedLog.entityType}
                  </p>
                </div>
                {selectedLog.entityId && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">ID de Entidad</p>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                      {selectedLog.entityId}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Dirección IP</p>
                  <p className="font-mono text-sm">{selectedLog.ipAddress || "No disponible"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Navegador</p>
                  <p className="text-xs truncate">{selectedLog.userAgent || "No disponible"}</p>
                </div>
              </div>

              {/* Detalles de cambios */}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Detalles de la Acción
                  </p>
                  
                  {/* Si hay información del usuario editado */}
                  {typeof selectedLog.details.usuarioEditado === 'string' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-amber-800 mb-1">
                        Usuario modificado:
                      </p>
                      <p className="text-sm text-amber-900 font-medium">
                        {selectedLog.details.usuarioEditado as string}
                      </p>
                    </div>
                  )}

                  {/* Si hay información del usuario eliminado */}
                  {(() => {
                    const eliminado = selectedLog.details.usuarioEliminado;
                    if (typeof eliminado === 'object' && eliminado !== null) {
                      const data = eliminado as Record<string, string>;
                      return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                          <p className="text-xs font-semibold text-red-800 mb-2">
                            Usuario eliminado:
                          </p>
                          <div className="text-sm text-red-900 space-y-1">
                            <p><span className="font-medium">Username:</span> {data.username || ""}</p>
                            <p><span className="font-medium">Nombre:</span> {data.nombre || ""}</p>
                            <p><span className="font-medium">Email:</span> {data.email || "N/A"}</p>
                            <p><span className="font-medium">Rol:</span> {data.rol || ""}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Si hay cambios específicos */}
                  {selectedLog.details.cambios && Array.isArray(selectedLog.details.cambios) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-800 mb-2">
                        Cambios realizados:
                      </p>
                      <div className="space-y-2">
                        {(selectedLog.details.cambios as Array<{ field: string; oldValue: string; newValue: string }>).map((change, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-blue-700 font-medium capitalize">
                              {change.field}:
                            </span>
                            <span className="text-red-600 line-through">
                              {String(change.oldValue)}
                            </span>
                            <span className="text-blue-400">→</span>
                            <span className="text-green-600 font-medium">
                              {String(change.newValue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Otros detalles */}
                  {(!selectedLog.details.cambios && !selectedLog.details.usuarioEditado && !selectedLog.details.usuarioEliminado) && (
                    <pre className="font-mono text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
