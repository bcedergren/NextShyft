
import { NotificationService } from '@/services/NotificationService';

test('notify triggers email and push when provided', async () => {
  const email = { send: jest.fn() };
  const push = { send: jest.fn() };
  const svc = new NotificationService(email as any, push as any);
  // Mock repo used internally by mongoose model; here we only assert calls
  await svc.notify({ orgId:'o1', userEmail:'u@x.com', type:'TEST', title:'t', body:'b', email:{ subject:'s', html:'<b></b>' }, push:{ title:'p', body:'q' } });
  expect(email.send).toHaveBeenCalled();
  expect(push.send).toHaveBeenCalled();
});
