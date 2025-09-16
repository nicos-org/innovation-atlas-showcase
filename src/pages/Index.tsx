import { useState, useEffect } from "react";
import { InnovationBanner } from "@/components/InnovationBanner";
import { WorldMap } from "@/components/WorldMap";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { CountryList } from "@/components/CountryList";
import { TimelineChart } from "@/components/TimelineChart";
import { InnovationSlider } from "@/components/InnovationSlider";
import { 
  loadAndProcessCSV, 
  loadCategoriesAndData,
  filterDataByCategories,
  getCategoryCounts,
  getTimelineData,
  type CountryInnovationCount,
  type InnovationData,
  type CategoryCount,
  type TimelineData
} from "@/utils/csvParser";
import { toast } from "sonner";

const Index = () => {
  const [innovationData, setInnovationData] = useState<CountryInnovationCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rawData, setRawData] = useState<InnovationData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);

  useEffect(() => {
    if (innovationData.length === 0) {
      loadData();
    }
  }, [innovationData.length]);

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

  // Effect for timeline data
  useEffect(() => {
    if (rawData.length > 0) {
      const timeline = getTimelineData(rawData);
      setTimelineData(timeline);
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

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  return (
    <div className="min-h-screen bg-background">
      <InnovationBanner />
      
      <div className="container mx-auto px-6 py-8">
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
              
              <InnovationSlider data={rawData} />
              
              <CountryList data={innovationData} />
              
              {/* Timeline Section */}
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                  <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
                    Innovations Over Time
                  </h3>
                  <div className="mb-2 text-center">
                    <p className="text-sm text-muted-foreground">
                      Timeline data points: {timelineData.length}
                    </p>
                  </div>
                  <TimelineChart data={timelineData.length > 0 ? timelineData : [
                    { year: '2020', count: 2, projects: ['Sample Project A', 'Sample Project B'] },
                    { year: '2021', count: 5, projects: ['Sample Project C', 'Sample Project D', 'Sample Project E', 'Sample Project F', 'Sample Project G'] },
                    { year: '2022', count: 8, projects: ['Sample Project H', 'Sample Project I', 'Sample Project J', 'Sample Project K', 'Sample Project L', 'Sample Project M', 'Sample Project N', 'Sample Project O'] },
                    { year: '2023', count: 6, projects: ['Sample Project P', 'Sample Project Q', 'Sample Project R', 'Sample Project S', 'Sample Project T', 'Sample Project U'] },
                    { year: '2024', count: 4, projects: ['Sample Project V', 'Sample Project W', 'Sample Project X', 'Sample Project Y'] },
                    { year: '2025', count: 3, projects: ['Sample Project Z', 'Sample Project AA', 'Sample Project BB'] }
                  ]} />
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      {innovationData.length > 0 && (
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
