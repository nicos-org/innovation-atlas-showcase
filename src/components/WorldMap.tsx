import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";

interface CountryData {
  country: string;
  count: number;
}

interface WorldMapProps {
  data: CountryData[];
  availableCategories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

export const WorldMap = ({ data, availableCategories, selectedCategories, onCategoryChange }: WorldMapProps) => {
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

    // Create a group for zoomable content
    const g = svg.append("g");

    // Set up zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create a map from country names to innovation counts
    const countryMap = new Map();
    data.forEach(d => {
      let countryName = d.country.toLowerCase();
      // Handle common country name variations for better matching
      if (countryName === "united states") countryName = "united states of america";
      if (countryName === "united kingdom") countryName = "united kingdom";
      countryMap.set(countryName, d.count);
    });

    // Color scale - discrete categories: 1, 2, 3+
    const getCategoryColor = (count: number) => {
      if (count === 0) return "#f8f9fa"; // No data
      if (count === 1) return "#dbeafe"; // Light blue for 1
      if (count === 2) return "#60a5fa"; // Medium blue for 2
      return "#1d4ed8"; // Dark blue for 3+
    };

    // Projection
    const projection = d3.geoNaturalEarth1()
      .scale(150)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Try multiple CDN sources for reliability
    const dataSources = [
      "https://raw.githubusercontent.com/topojson/world-atlas/master/countries-110m.json",
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
      "https://unpkg.com/world-atlas@3/countries-110m.json"
    ];

    const loadWorldData = async () => {
      for (const source of dataSources) {
        try {
          const response = await fetch(source);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const world = await response.json();
          
          // Import topojson feature function dynamically to avoid build issues
          const topojson = await import('topojson-client');
          const countries: any = topojson.feature(world, world.objects.countries);

          // Create the map
          g.selectAll("path")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", (d: any) => {
              const countryName = d.properties.NAME?.toLowerCase() || 
                                d.properties.name?.toLowerCase() || 
                                d.properties.NAME_EN?.toLowerCase() || "";
              const count = countryMap.get(countryName) || 0;
              return getCategoryColor(count);
            })
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.5)
            .attr("class", "country-path")
            .style("cursor", "pointer")
            .on("mouseover", function(event: any, d: any) {
              const countryName = d.properties.NAME || d.properties.name || d.properties.NAME_EN || "Unknown";
              const searchName = countryName.toLowerCase();
              const count = countryMap.get(searchName) || 0;
              
              d3.select(this)
                .attr("stroke-width", 2)
                .attr("stroke", "#2563eb")
                .style("filter", "brightness(1.1)");

              setTooltip({
                x: event.pageX,
                y: event.pageY,
                country: countryName,
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
                .attr("stroke", "#ffffff")
                .style("filter", "none");

              setTooltip(prev => ({ ...prev, visible: false }));
            });

          // Add subtle drop shadow and styling
          const defs = svg.append("defs");
          const filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("x", "-20%")
            .attr("y", "-20%")
            .attr("width", "140%")
            .attr("height", "140%");

          filter.append("feDropShadow")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("stdDeviation", 2)
            .attr("flood-opacity", 0.1);

          svg.selectAll(".country-path")
            .style("filter", "url(#drop-shadow)");

          toast.success("World map loaded successfully!");
          return; // Success, exit the loop
          
        } catch (error) {
          console.warn(`Failed to load from ${source}:`, error);
          continue; // Try next source
        }
      }
      
      // If all sources fail, show error
      throw new Error("All map data sources failed");
    };

    loadWorldData().catch((error) => {
      console.error("Error loading world map:", error);
      
      // Create a professional error state
      const errorGroup = svg.append("g")
        .attr("class", "error-state");

      errorGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#errorGradient)")
        .attr("rx", 8);

      const errorGradient = svg.select("defs").append("linearGradient")
        .attr("id", "errorGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");

      errorGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f8fafc");

      errorGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#e2e8f0");

      errorGroup.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "18")
        .attr("font-weight", "600")
        .attr("fill", "#475569")
        .text("Geographic data temporarily unavailable");

      errorGroup.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 + 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "14")
        .attr("fill", "#64748b")
        .text("Please check the data table below for country statistics");
      
      toast.error("Map visualization unavailable - data shown below");
    });

  }, [data]);

  return (
    <div className="relative w-full">
      <div className="bg-card rounded-xl shadow-soft p-6 innovation-glow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Global overview</h2>
          <p className="text-muted-foreground mt-2">
            Countries colored by innovation count categories: 1, 2, or 3+ innovations.
          </p>
        </div>
        
        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4 border">
          <svg
            ref={svgRef}
            className="w-full h-auto max-w-full"
            style={{ maxHeight: "500px" }}
          />
        </div>
        
        {/* Mouse wheel instruction - positioned below map on the right */}
        <div className="mt-4 flex justify-end">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 Use mouse wheel to zoom in/out, click and drag to pan
          </p>
        </div>

        {/* Enhanced Legend */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <h3 className="text-sm font-semibold text-foreground">Innovation Count Categories</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border" style={{ backgroundColor: "#dbeafe" }}></div>
              <span className="text-sm text-muted-foreground">1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border" style={{ backgroundColor: "#60a5fa" }}></div>
              <span className="text-sm text-muted-foreground">2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border" style={{ backgroundColor: "#1d4ed8" }}></div>
              <span className="text-sm text-muted-foreground">3+</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <h3 className="text-sm font-semibold text-foreground">Category</h3>
          <div className="w-full max-w-md">
            <MultiSelect
              options={availableCategories.map(category => ({
                label: category,
                value: category
              }))}
              selected={selectedCategories}
              onChange={onCategoryChange}
              placeholder="Select categories to filter..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-lg shadow-xl border pointer-events-none backdrop-blur-sm"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 50,
          }}
        >
          <div className="font-bold text-lg">{tooltip.country}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {tooltip.count} innovation{tooltip.count !== 1 ? 's' : ''}
          </div>
          {tooltip.count > 0 && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Click to explore details
            </div>
          )}
        </div>
      )}
    </div>
  );
};