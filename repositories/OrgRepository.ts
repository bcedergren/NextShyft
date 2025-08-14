import Org from '@/models/Org';
export interface IOrgRepository {
  findById(id: string): Promise<any | null>;
  updateById(id: string, patch: any): Promise<any>;
}
export class OrgRepository implements IOrgRepository {
  findById(id: string) {
    return (Org as any).findById(id);
  }
  updateById(id: string, patch: any) {
    return (Org as any).findByIdAndUpdate(id, { $set: patch }, { new: true });
  }
}
