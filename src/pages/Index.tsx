import { useState, useEffect } from "react";
import { InnovationBanner } from "@/components/InnovationBanner";
import { WorldMap } from "@/components/WorldMap";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { CountryList } from "@/components/CountryList";
import { 
  loadAndProcessCSV, 
  loadCategoriesAndData,
  filterDataByCategories,
  getCategoryCounts,
  type CountryInnovationCount,
  type InnovationData,
  type CategoryCount
} from "@/utils/csvParser";
import { toast } from "sonner";

const Index = () => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [innovationData, setInnovationData] = useState<CountryInnovationCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rawData, setRawData] = useState<InnovationData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);

  useEffect(() => {
    if (isMapVisible && innovationData.length === 0) {
      loadData();
    }
  }, [isMapVisible, innovationData.length]);

  useEffect(() => {
    if (rawData.length > 0) {
      const filteredData = filterDataByCategories(rawData, selectedCategories);
      setInnovationData(filteredData);
    }
  }, [rawData, selectedCategories]);

  // Separate effect for category data - always show all categories
  useEffect(() => {
    if (rawData.length > 0) {
      const categories = getCategoryCounts(rawData);
      setCategoryData(categories);
    }
  }, [rawData]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { categories, rawData: data } = await loadCategoriesAndData();
      setAvailableCategories(categories);
      setRawData(data);
      toast.success(`Loaded ${data.length} innovations across ${categories.length} categories`);
    } catch (error) {
      console.error("Failed to load innovation data:", error);
      toast.error("Failed to load innovation data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMap = () => {
    setIsMapVisible(!isMapVisible);
  };

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  return (
    <div className="min-h-screen bg-background">
      <InnovationBanner
        isExpanded={isMapVisible}
        onToggle={handleToggleMap}
      />
      
      <div className="container mx-auto px-6">
        <div
          className={`transition-all duration-500 ease-bounce overflow-hidden ${
            isMapVisible 
              ? "max-h-[2000px] opacity-100 py-8" 
              : "max-h-0 opacity-0 py-0"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading innovation data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <WorldMap 
                data={innovationData} 
                availableCategories={availableCategories}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
              
              {/* Dashboard Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-foreground mb-2">Innovation Dashboard</h2>
                  <p className="text-muted-foreground">
                    Comprehensive analysis of regulatory innovations across categories and countries
                  </p>
                </div>
                
                <CategoryBarChart data={categoryData} />
              </div>
              
              <CountryList data={innovationData} />
            </div>
          )}
        </div>
      </div>

      {/* Footer with stats */}
      {isMapVisible && innovationData.length > 0 && (
        <div className="container mx-auto px-6 pb-8">
          <div className="bg-gradient-subtle rounded-xl p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-foreground mb-4">Innovation Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-innovation">
                  {innovationData.length}
                </div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-innovation-secondary">
                  {innovationData.reduce((sum, country) => sum + country.count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Innovations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.max(...innovationData.map(country => country.count))}
                </div>
                <div className="text-sm text-muted-foreground">Max per Country</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
