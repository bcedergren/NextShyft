
import { InviteService } from '@/services/InviteService';

class MockEmail {
  sent: any[] = [];
  async send(to:string, subject:string, html:string){ this.sent.push({to,subject,html}); }
}

const mockUserRepoCount = jest.fn();
jest.mock('@/repositories/UserRepository', () => ({
  UserRepository: class { countByOrg = mockUserRepoCount }
}));

describe('InviteService', () => {
  it('throws when plan limit reached', async () => {
    const svc = new InviteService(new MockEmail() as any);
    mockUserRepoCount.mockResolvedValueOnce(999);
    await expect(svc.createInvite('org1','a@b.com','EMPLOYEE')).rejects.toThrow();
  });
});
