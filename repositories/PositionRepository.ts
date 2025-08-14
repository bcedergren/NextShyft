import Position from '@/models/Position';
export interface IPositionRepository {
  namesByIds(ids: string[]): Promise<Record<string, string>>;
}
export class PositionRepository implements IPositionRepository {
  async namesByIds(ids: string[]) {
    const docs = await (Position as any).find({ _id: { $in: ids } });
    const map: Record<string, string> = {};
    for (const p of docs) map[String(p._id)] = p.name;
    return map;
  }
}
