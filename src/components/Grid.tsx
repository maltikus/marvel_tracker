import type { WatchUnit } from '../data/types';
import UnitCard from './UnitCard';

export default function Grid({ units }: { units: WatchUnit[] }) {
  if (!units.length) return null;
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
      {units.map((u, i) => (
        <UnitCard key={u.id} unit={u} index={i} />
      ))}
    </div>
  );
}
