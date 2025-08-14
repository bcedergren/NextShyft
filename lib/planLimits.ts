
export const PLAN_LIMITS: Record<string, { staff: number }> = {
  free: { staff: 5 },
  pro: { staff: 25 },
  business: { staff: 9999 }
};

export function limitFor(plan?: string) {
  return PLAN_LIMITS[plan || 'pro'] || PLAN_LIMITS.pro;
}
