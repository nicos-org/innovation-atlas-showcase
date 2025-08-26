import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { toast } from "sonner";

interface CountryData {
  country: string;
  count: number;
}

interface WorldMapProps {
  data: CountryData[];
}

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
    const height = 500;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Create a map from country names to innovation counts
    const countryMap = new Map();
    data.forEach(d => {
      // Handle common country name variations
      let countryName = d.country.toLowerCase();
      if (countryName === "united states") countryName = "united states of america";
      if (countryName === "united kingdom") countryName = "united kingdom";
      countryMap.set(countryName, d.count);
    });

    // Color scale
    const maxCount = d3.max(data, d => d.count) || 1;
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxCount]);

    // Projection
    const projection = d3.geoNaturalEarth1()
      .scale(150)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load world data
    d3.json("https://unpkg.com/world-atlas@3/countries-110m.json").then((world: any) => {
      const countries = feature(world, world.objects.countries) as any;

      svg.selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", (d: any) => {
          const countryName = d.properties.name.toLowerCase();
          const count = countryMap.get(countryName) || 0;
          return count > 0 ? colorScale(count) : "#f0f0f0";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .attr("class", "transition-smooth cursor-pointer")
        .on("mouseover", function(event: any, d: any) {
          const countryName = d.properties.name.toLowerCase();
          const count = countryMap.get(countryName) || 0;
          
          d3.select(this)
            .attr("stroke-width", 2)
            .attr("stroke", "#2563eb");

          setTooltip({
            x: event.pageX,
            y: event.pageY,
            country: d.properties.name,
            count: count,
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
            .attr("stroke-width", 0.5)
            .attr("stroke", "#fff");

          setTooltip(prev => ({ ...prev, visible: false }));
        });

      toast.success("World map loaded successfully!");
    }).catch((error) => {
      console.error("Error loading world map:", error);
      toast.error("Failed to load world map data");
    });

  }, [data]);

  return (
    <div className="relative w-full">
      <div className="bg-card rounded-xl shadow-soft p-6 innovation-glow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Global Innovation Map</h2>
          <p className="text-muted-foreground mt-2">
            Countries shaded by number of innovations. Hover for details.
          </p>
        </div>
        
        <div className="relative bg-gradient-subtle rounded-lg p-4">
          <svg
            ref={svgRef}
            className="w-full h-auto max-w-full"
            style={{ maxHeight: "500px" }}
          />
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground">Fewer innovations</span>
          <div className="flex">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
              <div
                key={t}
                className="w-6 h-4"
                style={{
                  backgroundColor: d3.interpolateBlues(t),
                }}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">More innovations</span>
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