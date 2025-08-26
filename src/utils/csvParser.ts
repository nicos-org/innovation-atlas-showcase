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