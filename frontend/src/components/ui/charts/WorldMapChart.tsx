import React from "react";
import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";

interface GeographicData {
  country: string;
  country_code: string; // e.g., "US", "IN"
  click_count: number;
}

interface WorldMapChartProps {
  geographicData: GeographicData[];
}

const WorldMapChart: React.FC<WorldMapChartProps> = ({ geographicData }) => {
  // Convert to key-value format for region coloring
  const regionValues: Record<string, number> = {};
  geographicData.forEach((item) => {
    regionValues[item.country_code.toUpperCase()] = item.click_count;
  });

  // Calculate max value for color scaling

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full">
      <div className="w-full h-[400px]">
        <VectorMap
          map={worldMill}
          backgroundColor="transparent"
          regionStyle={{
            initial: {
              fill: "#f3f4f6", 
              fillOpacity: 1,
              stroke: "#ffffff",
              strokeWidth: 0.5,
            },
          }}
          series={{
            regions: [
              {
                attribute: "fill",
                values: regionValues,
                scale: ["#dbeafe", "#1e3a8a"],
                normalizeFunction: "linear",
              },
            ],
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 w-full max-w-md mx-auto">
        <div className="relative h-4 rounded w-full bg-gradient-to-r from-[#dbeafe] via-[#60a5fa] to-[#1e3a8a]" />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default WorldMapChart;
