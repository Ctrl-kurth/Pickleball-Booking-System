import { Star } from "lucide-react";

interface CoachCardProps {
  name: string;
  specialties: string[];
  hourlyRate: number;
  rating: number;
  image?: string;
}

export default function CoachCard({ name, specialties, hourlyRate, rating }: CoachCardProps) {
  return (
    <div className="card-premium group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{name}</h3>
          <p className="text-sm text-muted-foreground">{specialties.join(" • ")}</p>
        </div>
        <div className="flex items-center space-x-1 bg-muted px-2 py-1 rounded text-xs font-bold">
          <Star className="w-3 h-3 fill-current" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold">${hourlyRate}</span>
          <span className="text-xs text-muted-foreground ml-1">/ hour</span>
        </div>
        <button className="btn-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          Book Session
        </button>
      </div>
    </div>
  );
}
