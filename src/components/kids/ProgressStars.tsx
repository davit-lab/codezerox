import { Star } from "lucide-react";

interface ProgressStarsProps {
  total: number;
  filled: number;
}

const ProgressStars = ({ total, filled }: ProgressStarsProps) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 transition-all duration-300 ${
            i < filled
              ? "fill-yellow-400 text-yellow-400 scale-110"
              : "fill-transparent text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressStars;
