import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

interface BrowserChartProps {
  browserStats: Record<string, number>;
}

const BrowserChart: React.FC<BrowserChartProps> = ({ browserStats }) => {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#EC4899', // Pink
  ];

  const data = {
    labels: Object.keys(browserStats),
    datasets: [
      {
        data: Object.values(browserStats),
        backgroundColor: colors.slice(0, Object.keys(browserStats).length),
        borderColor: colors.slice(0, Object.keys(browserStats).length).map(color => color + '80'),
        borderWidth: 2,
        hoverOffset: 4,
        cutout: '60%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: import('chart.js').TooltipItem<'doughnut'>) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full">
      <h3 className="text-lg font-semibold mb-4">Browser Distribution</h3>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default BrowserChart; 