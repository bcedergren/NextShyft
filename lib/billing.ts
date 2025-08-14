
export type Plan = 'free'|'pro'|'business';

export const plans = {
  free: { priceId: null, price: 0, name: 'Free', desc: 'Up to 5 staff', limits: { staff: 5 } },
  pro: { priceId: process.env.STRIPE_PRICE_PRO || null, price: 49, name: 'Pro', desc: 'Up to 25 staff', limits: { staff: 25 } },
  business: { priceId: process.env.STRIPE_PRICE_BUSINESS || null, price: 99, name: 'Business', desc: 'Unlimited staff', limits: { staff: 9999 } },
};

export function getPlan(org: any): keyof typeof plans {
  return (org?.plan || 'pro') as any;
}
