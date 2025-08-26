import { CountryInnovationCount } from "@/utils/csvParser";

interface CountryListProps {
  data: CountryInnovationCount[];
}

export const CountryList = ({ data }: CountryListProps) => {
  if (!data.length) return null;

  return (
    <div className="bg-card rounded-xl shadow-soft p-6 mt-6">
      <h3 className="text-xl font-bold text-foreground mb-4">
        Innovation Rankings by Country
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.slice(0, 12).map((country, index) => (
          <div
            key={country.country}
            className="flex items-center justify-between p-3 bg-gradient-subtle rounded-lg hover:shadow-md transition-smooth"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <span className="font-medium text-foreground">
                {country.country}
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-innovation">
                {country.count}
              </div>
              <div className="text-xs text-muted-foreground">
                innovation{country.count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.length > 12 && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Showing top 12 of {data.length} countries
        </p>
      )}
    </div>
  );
};