-- Actualizar el CHECK de role en auth_users para aceptar los nuevos roles
alter table auth_users drop constraint if exists auth_users_role_check;
alter table auth_users add constraint auth_users_role_check
  check (role in ('admin', 'presidente', 'secretario', 'tesorero'));
