import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface TimelineData {
  year: string;
  count: number;
  projects: string[];
}

interface TimelineChartProps {
  data: TimelineData[];
}

export const TimelineChart = ({ data }: TimelineChartProps) => {
  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-muted-foreground">
          Number of new regulatory innovations released by year
        </p>
      </div>
      
      <div className="h-80 w-full">
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year" 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const projects = data.projects || [];
                      return (
                        <div className="bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm">
                          <div className="font-semibold text-foreground mb-2">
                            Year: {label}
                          </div>
                          <div className="font-semibold mb-2 text-primary">
                            {payload[0].value} Innovation{payload[0].value !== 1 ? 's' : ''}
                          </div>
                          {projects.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-1 text-foreground">Projects</div>
                              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                                {projects.map((project: string, index: number) => (
                                  <div key={index} className="bg-secondary/50 px-2 py-1 rounded text-foreground">
                                    {project}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">No data available for timeline</p>
                <div className="mt-4 space-y-2">
                  {data?.map((item, index) => (
                    <div key={index} className="text-sm">
                      {item.year}: {item.count} innovations
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
