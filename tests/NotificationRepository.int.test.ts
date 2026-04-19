
import { NotificationRepository } from '@/repositories/NotificationRepository';

type NotificationDoc = {
  orgId: string;
  userEmail: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
};

const store: NotificationDoc[] = [];

jest.mock('@/models/Notification', () => ({
  __esModule: true,
  default: {
    create: jest.fn(async (data: Omit<NotificationDoc, 'read'> & { read?: boolean }) => {
      const doc: NotificationDoc = { ...data, read: data.read ?? false };
      store.push(doc);
      return doc;
    }),
    find: jest.fn((query: { userEmail: string }) => ({
      sort: () => ({
        limit: (n: number) => Promise.resolve(store.filter((d) => d.userEmail === query.userEmail).slice(0, n)),
      }),
    })),
    countDocuments: jest.fn(async (query: { userEmail: string; read: boolean }) => (
      store.filter((d) => d.userEmail === query.userEmail && d.read === query.read).length
    )),
    updateMany: jest.fn(async (query: { userEmail: string; read: boolean }, update: { $set?: { read?: boolean } }) => {
      for (const doc of store) {
        if (doc.userEmail === query.userEmail && doc.read === query.read && update.$set?.read !== undefined) {
          doc.read = update.$set.read;
        }
      }
      return { acknowledged: true };
    }),
  },
}));

describe('NotificationRepository', () => {
  beforeEach(() => {
    store.length = 0;
  });

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
