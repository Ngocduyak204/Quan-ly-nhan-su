export const SHIFTS_ROUTER = {
  BASE: 'api/v1/shifts',
  CHECKIN: 'checkin',
  CHECKOUT: 'checkout',
  ACTIVE: 'active',
  MY_SHIFTS: 'my-shifts',
  ADMIN_ALL: 'admin/all',
  ADJUST_VOLUME: 'admin/:id/adjust-volume',
  REVIEW: 'admin/:id/review',
} as const;
