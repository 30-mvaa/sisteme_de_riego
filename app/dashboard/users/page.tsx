'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import type { Member, Role } from '@/lib/types';
import { ADMIN_ROLES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MemberDialog } from '@/components/member-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Plus,
  Pencil,
  Trash2,
  UserX,
  Search,
  Download,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Droplets,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function UsersPage() {
  const { members, deleteMember, currentUser, isHydrated } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!currentUser?.role || !ADMIN_ROLES.includes(currentUser.role as Role)) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-3">
        <UserX size={40} className="text-muted-foreground" />
        <p className="text-muted-foreground font-medium">
          No tienes permisos para ver esta página.
        </p>
      </div>
    );
  }

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.cedula.includes(search) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (member: Member) => {
    setEditMember(member);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditMember(null);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMember(deleteId);
      setDeleteId(null);
    }
  };

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setShowExportDialog(true);
  };

  const exportAllToCSV = () => {
    const headers = ['Cédula', 'Nombre', 'Correo', 'Teléfono', 'Hectáreas', 'Ubicación', 'Descripción', 'Fecha de Registro'];
    const rows = filtered.map((m) => [
      m.cedula,
      m.name,
      m.email || '',
      m.phone || '',
      m.land.hectares.toString(),
      m.land.location || '',
      m.land.description || '',
      new Date(m.createdAt).toLocaleDateString('es-ES'),
    ]);

    const csv = [headers, ...rows].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_chuichun_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllToPDF = () => {
    const lines: string[] = [
      '═══════════════════════════════════════════════════════════════',
      '                    REPORTE DE MIEMBROS',
      '                   CHUICHUN - ' + new Date().toLocaleDateString('es-ES'),
      '═══════════════════════════════════════════════════════════════',
      '',
      `Total de miembros: ${filtered.length}`,
      '',
      '───────────────────────────────────────────────────────────────',
    ];

    filtered.forEach((m, index) => {
      lines.push(`${index + 1}. ${m.name}`);
      lines.push(`   Cédula: ${m.cedula}`);
      lines.push(`   Correo: ${m.email || 'No registrado'}`);
      lines.push(`   Teléfono: ${m.phone || 'No registrado'}`);
      lines.push(`   Hectáreas: ${m.land.hectares}`);
      lines.push(`   Ubicación: ${m.land.location || 'No registrada'}`);
      lines.push(`   Descripción: ${m.land.description || 'Sin descripción'}`);
      lines.push(`   Registrado: ${new Date(m.createdAt).toLocaleDateString('es-ES')}`);
      lines.push('───────────────────────────────────────────────────────────────');
    });

    lines.push('');
    lines.push(`Generado el: ${new Date().toLocaleString('es-ES')}`);
    lines.push('═══════════════════════════════════════════════════════════════');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_chuichun_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = (member: Member) => {
    const content = `
========================================
FICHA DE MIEMBRO - CHUICHUN
========================================

INFORMACIÓN PERSONAL
--------------------
Cédula: ${member.cedula}
Nombre: ${member.name}
Correo: ${member.email || 'No registrado'}
Teléfono: ${member.phone || 'No registrado'}

INFORMACIÓN DEL TERRENO
-----------------------
Hectáreas: ${member.land.hectares}
Ubicación: ${member.land.location || 'No registrada'}
Descripción: ${member.land.description || 'Sin descripción'}

FECHA DE REGISTRO
------------------
${new Date(member.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}

========================================
Generado: ${new Date().toLocaleString('es-ES')}
========================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `miembro_${member.cedula}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (member: Member) => {
    const csv = [
      ['Campo', 'Valor'],
      ['Cédula', member.cedula],
      ['Nombre', member.name],
      ['Correo', member.email || ''],
      ['Teléfono', member.phone || ''],
      ['Hectáreas', member.land.hectares.toString()],
      ['Ubicación', member.land.location || ''],
      ['Descripción', member.land.description || ''],
      ['Fecha de Registro', new Date(member.createdAt).toLocaleDateString('es-ES')],
    ].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `miembro_${member.cedula}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los miembros del sistema. {filtered.length} miembros
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {filtered.length > 0 && (
            <>
              <Button variant="outline" onClick={exportAllToCSV} className="gap-2">
                <Download size={16} aria-hidden="true" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={exportAllToPDF} className="gap-2">
                <FileText size={16} aria-hidden="true" />
                Exportar Todo
              </Button>
            </>
          )}
          <Button onClick={handleNew} className="gap-2">
            <Plus size={16} aria-hidden="true" />
            Agregar Usuario
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Buscar por nombre, cédula o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cédula
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nombre
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Correo
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                Teléfono
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Registro
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
                  {search
                    ? 'No se encontraron usuarios.'
                    : 'No hay usuarios. Agrega el primero.'}
                </td>
              </tr>
            ) : (
              filtered.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-muted-foreground">
                    {member.cedula}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {member.name}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                    {member.email}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">
                    {member.phone}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell">
                    {new Date(member.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleViewDetails(member)}
                        aria-label={`Ver detalles de ${member.name}`}
                        title="Ver detalles y exportar"
                      >
                        <FileText size={14} aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(member)}
                        aria-label={`Editar ${member.name}`}
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(member.id)}
                        aria-label={`Eliminar ${member.name}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <MemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editMember}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente
              este usuario del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Detalles del Miembro
            </DialogTitle>
            <DialogDescription>
              Información completa del miembro seleccionado.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6 pt-2">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                >
                  {selectedMember.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Registrado el {new Date(selectedMember.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cédula</p>
                    <p className="font-mono font-medium">{selectedMember.cedula}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Correo</p>
                    <p className="font-medium">{selectedMember.email || 'No registrado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{selectedMember.phone || 'No registrado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Droplets size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hectáreas</p>
                    <p className="font-medium">{selectedMember.land.hectares} ha</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin size={16} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ubicación</p>
                    <p className="font-medium">{selectedMember.land.location || 'No registrada'}</p>
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Exportar información</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      if (selectedMember) exportToPDF(selectedMember);
                    }}
                  >
                    <FileText size={16} />
                    Texto (.txt)
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      if (selectedMember) exportToCSV(selectedMember);
                    }}
                  >
                    <Download size={16} />
                    CSV (.csv)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
