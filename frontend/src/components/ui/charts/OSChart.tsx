import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface OSChartProps {
  osStats: Record<string, number>;
}

const OSChart: React.FC<OSChartProps> = ({ osStats }) => {
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
    labels: Object.keys(osStats),
    datasets: [
      {
        label: 'Clicks',
        data: Object.values(osStats),
        backgroundColor: colors.slice(0, Object.keys(osStats).length),
        borderColor: colors.slice(0, Object.keys(osStats).length).map(color => color + '80'),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: import('chart.js').TooltipItem<'bar'>) {
            const dataset = context.dataset.data as number[];
            const total = dataset.reduce((a, b) => a + b, 0);

            const value = context.parsed.y ?? 0;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full">
      <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default OSChart; 