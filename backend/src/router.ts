import { Routes } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShiftsModule } from './shifts/shifts.module';
import { WageRatesModule } from './wage-rates/wage-rates.module';
import { WagePeriodsModule } from './wage-periods/wage-periods.module';
import { ReportsModule } from './reports/reports.module';

// Cấu hình tiền tố API toàn dự án
export const API_PREFIX = 'api/v1';

// NestJS RouterModule Tree Mapping
export const appRoutes: Routes = [
  {
    path: API_PREFIX,
    children: [
      {
        path: 'auth',
        module: AuthModule,
      },
      {
        path: 'users',
        module: UsersModule,
      },
      {
        path: 'shifts',
        module: ShiftsModule,
      },
      {
        path: 'wage-rates',
        module: WageRatesModule,
      },
      {
        path: 'wage-periods',
        module: WagePeriodsModule,
      },
      {
        path: 'reports',
        module: ReportsModule,
      },
    ],
  },
];

// Danh sách đường dẫn API tập trung (Typed Centralized API Map)
export const API_ROUTES = {
  AUTH: {
    REGISTER: `/${API_PREFIX}/auth/register`,
    LOGIN: `/${API_PREFIX}/auth/login`,
    REFRESH: `/${API_PREFIX}/auth/refresh`,
    LOGOUT: `/${API_PREFIX}/auth/logout`,
    PROFILE: `/${API_PREFIX}/auth/profile`,
  },
  USERS: {
    BASE: `/${API_PREFIX}/users`,
    BY_ID: (id: string) => `/${API_PREFIX}/users/${id}`,
    RESET_PASSWORD: (id: string) => `/${API_PREFIX}/users/${id}/reset-password`,
  },
  SHIFTS: {
    CHECKIN: `/${API_PREFIX}/shifts/checkin`,
    CHECKOUT: `/${API_PREFIX}/shifts/checkout`,
    ACTIVE: `/${API_PREFIX}/shifts/active`,
    MY_SHIFTS: `/${API_PREFIX}/shifts/my-shifts`,
    ADMIN_ALL: `/${API_PREFIX}/shifts/admin/all`,
    ADJUST_VOLUME: (id: string) => `/${API_PREFIX}/shifts/admin/${id}/adjust-volume`,
    REVIEW: (id: string) => `/${API_PREFIX}/shifts/admin/${id}/review`,
  },
  WAGE_RATES: {
    BASE: `/${API_PREFIX}/wage-rates`,
    CURRENT: `/${API_PREFIX}/wage-rates/current`,
  },
  WAGE_PERIODS: {
    BASE: `/${API_PREFIX}/wage-periods`,
    LOCK: (id: string) => `/${API_PREFIX}/wage-periods/${id}/lock`,
  },
  REPORTS: {
    SUMMARY: `/${API_PREFIX}/reports/summary`,
  },
};
