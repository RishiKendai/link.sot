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

interface CountryChartProps {
  countryStats: Record<string, number>;
}

const CountryChart: React.FC<CountryChartProps> = ({ countryStats }) => {
  // Sort countries by click count and take top 10
  const sortedCountries = Object.entries(countryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#EC4899', // Pink
    '#84CC16', // Lime
    '#F472B6', // Pink
  ];

  const data = {
    labels: sortedCountries.map(([country]) => country),
    datasets: [
      {
        label: 'Clicks',
        data: sortedCountries.map(([, clicks]) => clicks),
        backgroundColor: colors.slice(0, sortedCountries.length),
        borderColor: colors.slice(0, sortedCountries.length).map(color => color + '80'),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Top Countries</h3>
      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default CountryChart; 