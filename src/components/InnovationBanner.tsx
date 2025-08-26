import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InnovationBannerProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const InnovationBanner = ({ isExpanded, onToggle }: InnovationBannerProps) => {
  return (
    <div className="w-full bg-gradient-primary shadow-soft">
      <div className="container mx-auto px-6 py-8">
        <button
          onClick={onToggle}
          className={cn(
            "group flex items-center gap-4 text-white transition-smooth",
            "hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg p-2 -m-2"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "transition-all duration-300 ease-bounce",
              isExpanded ? "rotate-90" : "rotate-0"
            )}>
              {isExpanded ? (
                <ChevronDownIcon className="h-6 w-6" />
              ) : (
                <ChevronRightIcon className="h-6 w-6" />
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Innovations
            </h1>
          </div>
          <div className="flex-1 text-left">
            <p className="text-white/90 text-lg font-medium">
              {isExpanded 
                ? "Explore global innovation patterns" 
                : "Click to explore innovation data worldwide"
              }
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};