export interface InnovationData {
  agency: string;
  country: string;
  project: string;
  category: string;
  technical_innovation: string;
  innovation_x5: string;
  when: string;
  still_active: string;
  source: string;
}

export interface CountryInnovationCount {
  country: string;
  count: number;
}

export interface CategoryData {
  categories: string[];
  rawData: InnovationData[];
}

export async function loadAndProcessCSV(): Promise<CountryInnovationCount[]> {
  try {
    const response = await fetch('/innovations.csv');
    const csvText = await response.text();
    
    // Parse CSV manually (simple implementation)
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const countryIndex = headers.indexOf('country');
    
    if (countryIndex === -1) {
      throw new Error('Country column not found in CSV');
    }
    
    // Count innovations per country (case-insensitive)
    const countryCount = new Map<string, number>();
    
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',');
      if (columns.length > countryIndex) {
        const country = columns[countryIndex].trim().toLowerCase();
        if (country) {
          countryCount.set(country, (countryCount.get(country) || 0) + 1);
        }
      }
    }
    
    // Convert to array and sort by count (descending)
    const result: CountryInnovationCount[] = Array.from(countryCount.entries())
      .map(([country, count]) => ({
        country: country.charAt(0).toUpperCase() + country.slice(1), // Capitalize first letter
        count,
      }))
      .sort((a, b) => b.count - a.count);
    
    return result;
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw error;
  }
}

export async function loadCategoriesAndData(): Promise<CategoryData> {
  try {
    const response = await fetch('/innovations.csv');
    const csvText = await response.text();
    
    // Parse CSV manually (simple implementation)
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const countryIndex = headers.indexOf('country');
    const categoryIndex = headers.indexOf('category');
    const agencyIndex = headers.indexOf('agency');
    const projectIndex = headers.indexOf('project');
    const technicalInnovationIndex = headers.indexOf('technical_innovation');
    const innovationX5Index = headers.indexOf('innovation_x5');
    const whenIndex = headers.indexOf('When?');
    const stillActiveIndex = headers.indexOf('still_active?');
    const sourceIndex = headers.indexOf('source');
    
    if (countryIndex === -1 || categoryIndex === -1) {
      throw new Error('Required columns not found in CSV');
    }
    
    const categories = new Set<string>();
    const rawData: InnovationData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',');
      if (columns.length > Math.max(countryIndex, categoryIndex)) {
        const country = columns[countryIndex]?.trim() || '';
        const category = columns[categoryIndex]?.trim() || '';
        
        if (country && category) {
          categories.add(category);
          rawData.push({
            agency: columns[agencyIndex]?.trim() || '',
            country: country,
            project: columns[projectIndex]?.trim() || '',
            category: category,
            technical_innovation: columns[technicalInnovationIndex]?.trim() || '',
            innovation_x5: columns[innovationX5Index]?.trim() || '',
            when: columns[whenIndex]?.trim() || '',
            still_active: columns[stillActiveIndex]?.trim() || '',
            source: columns[sourceIndex]?.trim() || '',
          });
        }
      }
    }
    
    return {
      categories: Array.from(categories).sort(),
      rawData,
    };
  } catch (error) {
    console.error('Error loading categories and data:', error);
    throw error;
  }
}

export function filterDataByCategories(
  rawData: InnovationData[], 
  selectedCategories: string[]
): CountryInnovationCount[] {
  if (selectedCategories.length === 0) {
    // If no categories selected, return all data
    const countryCount = new Map<string, number>();
    rawData.forEach(item => {
      const country = item.country.toLowerCase();
      countryCount.set(country, (countryCount.get(country) || 0) + 1);
    });
    
    return Array.from(countryCount.entries())
      .map(([country, count]) => ({
        country: country.charAt(0).toUpperCase() + country.slice(1),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }
  
  // Filter by selected categories
  const filteredData = rawData.filter(item => 
    selectedCategories.includes(item.category)
  );
  
  const countryCount = new Map<string, number>();
  filteredData.forEach(item => {
    const country = item.country.toLowerCase();
    countryCount.set(country, (countryCount.get(country) || 0) + 1);
  });
  
  return Array.from(countryCount.entries())
    .map(([country, count]) => ({
      country: country.charAt(0).toUpperCase() + country.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}