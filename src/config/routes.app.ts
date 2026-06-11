import type { RoleName } from '@/enum/role'
import { RoutesEnum } from '@/enum/routes..app'

type RouteConfig = {
  auth: boolean
  roles: RoleName[]
  permission: string[]
  title: string
  search: boolean
}

export const routesConfig: Record<RoutesEnum, RouteConfig> = {
  [RoutesEnum.ROOT]: {
    auth: true,
    roles: [],
    permission: ['*'],
    title: 'Inicio',
    search: false,
  },
  [RoutesEnum.LOGIN]: {
    auth: false,
    roles: [],
    permission: ['*'],
    title: 'Login',
    search: false,
  },
  [RoutesEnum.DASHBOARD]: {
    auth: true,
    roles: ['*'],
    permission: ['*'],
    title: 'Dashboard',
    search: true,
  },
  [RoutesEnum.ROLES]: {
    auth: true,
    roles: ['*'],
    permission: ['*'],
    title: 'Roles',
    search: true,
  },
  [RoutesEnum.PERMISSIONS]: {
    auth: true,
    roles: ['*'],
    permission: ['*'],
    title: 'Permisos',
    search: true,
  },
  [RoutesEnum.CINE]: {
    auth: true,
    roles: ['*'],
    permission: ['*'],
    title: 'Cine',
    search: false,
  },
  [RoutesEnum.CINE_CATALOGO]: {
    auth: true,
    roles: ['*'],
    permission: ['*'],
    title: 'Catálogo de funciones',
    search: true,
  },
  [RoutesEnum.CINE_PELICULAS]: {
    auth: true,
    roles: ['*'],
    permission: ['*'],
    title: 'Películas',
    search: true,
  },
  [RoutesEnum.CINE_SALAS]: {
    auth: true,
    roles: ['*'],
    permission: ['*'],
    title: 'Salas',
    search: true,
  },
  [RoutesEnum.CINE_RESERVAS]: {
    auth: true,
    roles: ['*'],
    permission: ['*'],
    title: 'Reservas',
    search: true,
  },
} as const
