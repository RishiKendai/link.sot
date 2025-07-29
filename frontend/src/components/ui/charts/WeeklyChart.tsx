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

interface WeeklyChartProps {
  weeklyStats: Record<number, number>;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ weeklyStats }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Create data array for 7 days (0-6)
  const data = Array.from({ length: 7 }, (_, i) => weeklyStats[i] || 0);

  const chartData = {
    labels: dayNames,
    datasets: [
      {
        label: 'Clicks',
        data,
        backgroundColor: [
          '#3B82F6', // Blue - Sunday
          '#10B981', // Green - Monday
          '#F59E0B', // Yellow - Tuesday
          '#EF4444', // Red - Wednesday
          '#8B5CF6', // Purple - Thursday
          '#06B6D4', // Cyan - Friday
          '#F97316', // Orange - Saturday
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED',
          '#0891B2',
          '#EA580C',
        ],
        borderWidth: 2,
        borderRadius: 6,
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
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Weekly Click Distribution</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WeeklyChart; 