import React from 'react';
import WorldMap from 'react-svg-worldmap';

interface GeographicData {
  country: string;
  country_code: string;
  click_count: number;
}

interface WorldMapChartProps {
  geographicData: GeographicData[];
}

const WorldMapChart: React.FC<WorldMapChartProps> = ({ geographicData }) => {
  // Convert geographic data to the format expected by react-svg-worldmap
  const data = geographicData.map(item => ({
    country: item.country_code,
    value: item.click_count
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Geographic Click Distribution</h3>
      <div className="relative">
        <div className="w-full h-96">
          <WorldMap
            data={data}
            size="responsive"
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span className="text-sm text-gray-600">No clicks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-200 rounded"></div>
            <span className="text-sm text-gray-600">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <span className="text-sm text-gray-600">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-sm text-gray-600">High</span>
          </div>
        </div>

        {/* Top Countries List */}
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Top Countries</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {geographicData
              .sort((a, b) => b.click_count - a.click_count)
              .slice(0, 6)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{item.country}</span>
                  <span className="text-sm text-blue-600 font-bold">{item.click_count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMapChart; 