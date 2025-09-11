import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface CategoryData {
  category: string;
  count: number;
}

interface CategoryBarChartProps {
  data: CategoryData[];
}

export const CategoryBarChart = ({ data }: CategoryBarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 80, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Sort data by count (descending)
    const sortedData = [...data].sort((a, b) => b.count - a.count);

    // Scales
    const xScale = d3.scaleBand()
      .domain(sortedData.map(d => d.category))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.count) || 0])
      .range([height, 0]);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(sortedData.map(d => d.category))
      .range(d3.schemeBlues[6]);

    // Bars
    g.selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.category) || 0)
      .attr("width", xScale.bandwidth())
      .attr("y", d => yScale(d.count))
      .attr("height", d => height - yScale(d.count))
      .attr("fill", d => colorScale(d.category) as string)
      .attr("rx", 4)
      .attr("ry", 4)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("opacity", 0.8)
          .style("filter", "brightness(1.1)");
        
        // Show tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px 12px")
          .style("border-radius", "4px")
          .style("font-size", "14px")
          .style("pointer-events", "none")
          .style("z-index", "1000")
          .style("opacity", 0);

        tooltip.transition()
          .duration(200)
          .style("opacity", 1);

        tooltip.html(`
          <div><strong>${d.category}</strong></div>
          <div>${d.count} innovation${d.count !== 1 ? 's' : ''}</div>
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", function(event) {
        d3.select("body").select(".tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("opacity", 1)
          .style("filter", "none");
        
        d3.select("body").select(".tooltip").remove();
      });

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "12px");

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .style("font-size", "12px");

    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("Number of Innovations");

    // Add value labels on top of bars
    g.selectAll(".value-label")
      .data(sortedData)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", d => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.count) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .text(d => d.count);

  }, [data]);

  return (
    <div className="bg-card rounded-xl shadow-soft p-6 innovation-glow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Innovations by Category</h2>
        <p className="text-muted-foreground mt-2">
          Distribution of innovations across different regulatory categories.
        </p>
      </div>
      
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4 border">
        <svg
          ref={svgRef}
          className="w-full h-auto max-w-full"
          style={{ maxHeight: "400px" }}
        />
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-innovation">
            {data.length}
          </div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-innovation-secondary">
            {data.reduce((sum, category) => sum + category.count, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Innovations</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {Math.max(...data.map(category => category.count))}
          </div>
          <div className="text-sm text-muted-foreground">Max per Category</div>
        </div>
      </div>
    </div>
  );
};
