/**
 * Tập trung tất cả đường dẫn Giao diện (Pages) và API Endpoints cho Frontend
 */

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  WORKER: {
    DASHBOARD: '/worker',
    CHECKIN: '/worker/checkin',
    CHECKOUT: '/worker/checkout',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    SHIFTS: '/admin/shifts',
    ANOMALIES: '/admin/anomalies',
    WAGE_RATES: '/admin/wage-rates',
    PERIODS: '/admin/periods',
    REPORTS: '/admin/reports',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
  },
  SHIFTS: {
    CHECKIN: '/shifts/checkin',
    CHECKOUT: '/shifts/checkout',
    ACTIVE: '/shifts/active',
    MY_SHIFTS: '/shifts/my-shifts',
    ADMIN_ALL: '/shifts/admin/all',
    ADJUST_VOLUME: (id: string) => `/shifts/admin/${id}/adjust-volume`,
    REVIEW: (id: string) => `/shifts/admin/${id}/review`,
  },
  WAGE_RATES: {
    BASE: '/wage-rates',
    CURRENT: '/wage-rates/current',
  },
  WAGE_PERIODS: {
    BASE: '/wage-periods',
    LOCK: (id: string) => `/wage-periods/${id}/lock`,
  },
  REPORTS: {
    SUMMARY: '/reports/summary',
  },
};
