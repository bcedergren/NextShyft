
import { NotificationRepository } from '@/repositories/NotificationRepository';

describe('NotificationRepository', () => {
  it('creates, counts, lists and marks read', async () => {
    const repo = new NotificationRepository();
    await repo.create({ orgId: 'o1', userEmail: 'u@x.com', type: 'TEST', title: 'Hello', body: 'World' });
    const count = await repo.countUnread('u@x.com');
    expect(count).toBe(1);
    const items = await repo.listByUser('u@x.com');
    expect(items.length).toBeGreaterThan(0);
    await repo.markAllRead('u@x.com');
    const count2 = await repo.countUnread('u@x.com');
    expect(count2).toBe(0);
  });
});
