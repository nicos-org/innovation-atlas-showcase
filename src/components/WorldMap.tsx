import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { toast } from "sonner";

interface CountryData {
  country: string;
  count: number;
}

interface WorldMapProps {
  data: CountryData[];
}

// Simple country positions for visualization (approximate coordinates)
const countryPositions: Record<string, { x: number; y: number; region: string }> = {
  "united states": { x: 200, y: 180, region: "North America" },
  "singapore": { x: 700, y: 280, region: "Asia" },
  "germany": { x: 480, y: 140, region: "Europe" },
  "japan": { x: 740, y: 170, region: "Asia" },
  "india": { x: 650, y: 220, region: "Asia" },
  "china": { x: 680, y: 160, region: "Asia" },
  "russia": { x: 580, y: 100, region: "Europe/Asia" },
  "canada": { x: 180, y: 120, region: "North America" },
  "south korea": { x: 720, y: 170, region: "Asia" },
  "united arab emirates": { x: 580, y: 240, region: "Middle East" },
  "united kingdom": { x: 460, y: 130, region: "Europe" },
  "france": { x: 470, y: 150, region: "Europe" },
  "italy": { x: 490, y: 170, region: "Europe" },
  "argentina": { x: 280, y: 350, region: "South America" },
  "israel": { x: 520, y: 230, region: "Middle East" },
  "switzerland": { x: 480, y: 150, region: "Europe" },
  "brazil": { x: 300, y: 300, region: "South America" },
  "netherlands": { x: 470, y: 140, region: "Europe" },
  "sweden": { x: 490, y: 110, region: "Europe" },
};

export const WorldMap = ({ data }: WorldMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    country: string;
    count: number;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    country: "",
    count: 0,
    visible: false,
  });

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 960;
    const height = 400;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Create a map from country names to innovation counts
    const countryMap = new Map();
    data.forEach(d => {
      const countryName = d.country.toLowerCase();
      countryMap.set(countryName, d.count);
    });

    // Color scale
    const maxCount = d3.max(data, d => d.count) || 1;
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxCount]);

    // Size scale for circles
    const sizeScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([8, 40]);

    // Add background continents (simplified shapes)
    const continents = [
      { name: "North America", path: "M50,120 Q200,80 350,120 L350,200 Q200,240 50,200 Z", color: "#f8f9fa" },
      { name: "South America", path: "M250,280 Q300,260 350,280 L350,380 Q300,400 250,380 Z", color: "#f8f9fa" },
      { name: "Europe", path: "M420,100 Q520,80 580,100 L580,180 Q520,200 420,180 Z", color: "#f8f9fa" },
      { name: "Asia", path: "M580,80 Q720,60 860,80 L860,280 Q720,300 580,280 Z", color: "#f8f9fa" },
      { name: "Africa", path: "M460,200 Q540,180 580,200 L580,320 Q540,340 460,320 Z", color: "#f8f9fa" },
    ];

    // Draw continents
    svg.selectAll(".continent")
      .data(continents)
      .enter()
      .append("path")
      .attr("class", "continent")
      .attr("d", d => d.path)
      .attr("fill", d => d.color)
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1);

    // Add country circles
    const countries = data.filter(d => countryPositions[d.country.toLowerCase()]);
    
    svg.selectAll(".country-circle")
      .data(countries)
      .enter()
      .append("circle")
      .attr("class", "country-circle")
      .attr("cx", d => countryPositions[d.country.toLowerCase()]?.x || 0)
      .attr("cy", d => countryPositions[d.country.toLowerCase()]?.y || 0)
      .attr("r", d => sizeScale(d.count))
      .attr("fill", d => colorScale(d.count))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8)
      .style("cursor", "pointer")
      .on("mouseover", function(event: any, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "hsl(214 84% 56%)")
          .attr("stroke-width", 3)
          .attr("opacity", 1);

        setTooltip({
          x: event.pageX,
          y: event.pageY,
          country: d.country,
          count: d.count,
          visible: true,
        });
      })
      .on("mousemove", function(event: any) {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX,
          y: event.pageY,
        }));
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .attr("opacity", 0.8);

        setTooltip(prev => ({ ...prev, visible: false }));
      });

    // Add labels for major countries
    const majorCountries = countries.filter(d => d.count >= 5);
    
    svg.selectAll(".country-label")
      .data(majorCountries)
      .enter()
      .append("text")
      .attr("class", "country-label")
      .attr("x", d => countryPositions[d.country.toLowerCase()]?.x || 0)
      .attr("y", d => (countryPositions[d.country.toLowerCase()]?.y || 0) + sizeScale(d.count) + 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12")
      .attr("font-weight", "500")
      .attr("fill", "#374151")
      .text(d => d.country);

    toast.success("Innovation map loaded successfully!");

  }, [data]);

  return (
    <div className="relative w-full">
      <div className="bg-card rounded-xl shadow-soft p-6 innovation-glow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Global Innovation Map</h2>
          <p className="text-muted-foreground mt-2">
            Circle size represents innovation count. Hover for details.
          </p>
        </div>
        
        <div className="relative bg-gradient-subtle rounded-lg p-4">
          <svg
            ref={svgRef}
            className="w-full h-auto max-w-full"
            style={{ maxHeight: "400px" }}
          />
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Innovation Count:</span>
            <div className="flex items-center gap-2">
              <circle className="w-3 h-3 rounded-full bg-blue-200"></circle>
              <span className="text-xs">Low</span>
              <circle className="w-4 h-4 rounded-full bg-blue-400"></circle>
              <span className="text-xs">Medium</span>
              <circle className="w-6 h-6 rounded-full bg-blue-600"></circle>
              <span className="text-xs">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg border pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 40,
          }}
        >
          <div className="font-semibold">{tooltip.country}</div>
          <div className="text-sm">
            {tooltip.count} innovation{tooltip.count !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};