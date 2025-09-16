export interface InnovationData {
  agency: string;
  country: string;
  name: string;
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

export interface CategoryCount {
  category: string;
  count: number;
}

export interface TimelineData {
  year: string;
  count: number;
  projects: string[];
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

// Helper function to parse CSV line properly handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export async function loadCategoriesAndData(): Promise<CategoryData> {
  try {
    const response = await fetch('/innovations.csv');
    const csvText = await response.text();
    
    // Parse CSV properly handling quoted fields
    const lines = csvText.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    
    const countryIndex = headers.indexOf('country');
    const categoryIndex = headers.indexOf('category');
    const agencyIndex = headers.indexOf('agency');
    const nameIndex = headers.indexOf('name');
    const projectIndex = headers.indexOf('project');
    const technicalInnovationIndex = headers.indexOf('technical_innovation');
    const innovationX5Index = headers.indexOf('innovation_x5');
    const innovationAnalysisIndex = headers.indexOf('innovation_analysis');
    const whenIndex = headers.indexOf('When?');
    const stillActiveIndex = headers.indexOf('still_active?');
    const sourceIndex = headers.indexOf('source');
    
    if (countryIndex === -1 || categoryIndex === -1) {
      throw new Error('Required columns not found in CSV');
    }
    
    const categories = new Set<string>();
    const rawData: InnovationData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);
      if (columns.length > Math.max(countryIndex, categoryIndex)) {
        const country = columns[countryIndex]?.trim() || '';
        const category = columns[categoryIndex]?.trim() || '';
        const when = columns[whenIndex]?.trim() || '';
        
        
        if (country && category) {
          categories.add(category);
          rawData.push({
            agency: columns[agencyIndex]?.trim() || '',
            country: country,
            name: columns[nameIndex]?.trim() || '',
            project: columns[projectIndex]?.trim() || '',
            category: category,
            technical_innovation: columns[technicalInnovationIndex]?.trim() || '',
            innovation_x5: columns[innovationX5Index]?.trim() || '',
            when: when,
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

export function getCategoryCounts(rawData: InnovationData[]): CategoryCount[] {
  const categoryCount = new Map<string, number>();
  
  rawData.forEach(item => {
    const category = item.category;
    if (category) {
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    }
  });
  
  return Array.from(categoryCount.entries())
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getTimelineData(rawData: InnovationData[]): TimelineData[] {
  const yearData = new Map<string, { count: number; projects: string[] }>();
  
  rawData.forEach((item) => {
    const year = item.when?.trim();
    // Only include valid years (4 digits)
    if (year && /^\d{4}$/.test(year)) {
      const existing = yearData.get(year) || { count: 0, projects: [] };
      existing.count += 1;
      if (item.name && item.name.trim() !== '') {
        existing.projects.push(item.name.trim());
      }
      yearData.set(year, existing);
    }
  });
  
  return Array.from(yearData.entries())
    .map(([year, data]) => ({
      year,
      count: data.count,
      projects: data.projects,
    }))
    .sort((a, b) => a.year.localeCompare(b.year));
}