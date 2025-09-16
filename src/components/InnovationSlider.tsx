import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InnovationData } from "@/utils/csvParser";

interface InnovationSliderProps {
  data: InnovationData[];
}

export const InnovationSlider = ({ data }: InnovationSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out items without project text
  const validProjects = data.filter(item => item.project && item.project.trim() !== '');
  
  useEffect(() => {
    if (validProjects.length === 0) return;

    // Auto-advance slider every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === validProjects.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [validProjects.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? validProjects.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === validProjects.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (validProjects.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="text-center">
          <p className="text-muted-foreground">No innovation projects available</p>
        </div>
      </div>
    );
  }

  const currentProject = validProjects[currentIndex];

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground">Innovation Projects</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {validProjects.length}
          </span>
        </div>
      </div>
      
      <div className="relative">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevious}
            className="flex-shrink-0 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            aria-label="Previous project"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>
          
          <div className="flex-1 min-h-[120px] flex items-center">
            <div className="w-full">
              <div className="mb-2">
                <span className="text-sm font-medium text-primary">
                  {currentProject.country} • {currentProject.agency}
                </span>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {currentProject.project}
              </h4>
              <div className="text-sm text-muted-foreground">
                <span className="inline-block bg-secondary px-2 py-1 rounded-md mr-2">
                  {currentProject.category}
                </span>
                {currentProject.when && (
                  <span className="inline-block bg-secondary px-2 py-1 rounded-md">
                    {currentProject.when}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={goToNext}
            className="flex-shrink-0 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            aria-label="Next project"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </button>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center mt-4 gap-2">
          {validProjects.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-primary' 
                  : 'bg-muted hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to project ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

