import React, { useState, useMemo } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface WeeklyChartProps {
  weeklyStats: Record<number, number>;
  dailyStats: Record<string, number>;
  monthlyStats: Record<number, number>;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ weeklyStats, dailyStats, monthlyStats }) => {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const { labels, data } = useMemo(() => {
    let labels: string[] = [];
    let data: number[] = [];

    if (view === 'weekly') {
      labels = dayNames;
      data = Array.from({ length: 7 }, (_, i) => weeklyStats[i] || 0);
    } else if (view === 'monthly') {
      labels = monthNames;
      data = Array.from({ length: 12 }, (_, i) => monthlyStats[i + 1] || 0); // month index starts from 1
    } else {
      // labels = Object.keys(dailyStats).sort(); // YYYY-MM-DD
      // data = labels.map(date => dailyStats[date] || 0);
      const sortedDates = Object.keys(dailyStats).sort();

      labels = sortedDates.map(dateStr => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        });
      });

      data = sortedDates.map(dateStr => dailyStats[dateStr] || 0);
    }

    return { labels, data };
  }, [view, weeklyStats, dailyStats, monthlyStats]);

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#F97316', '#EC4899',
    '#14B8A6', '#A855F7', '#F43F5E', '#4F46E5',
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Clicks',
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length).map(c => c + '99'),
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: import('chart.js').TooltipItem<'bar'>) {
            const total = (context.dataset.data as (number | [number, number] | null)[])
              .filter((v): v is number => typeof v === 'number')
              .reduce((a: number, b: number) => a + b, 0);
            const value = context.parsed.y ?? 0;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { color: '#6b7280' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280' },
      },
    },
  };

  const tabs: ('daily' | 'weekly' | 'monthly')[] = ['daily', 'weekly', 'monthly'];
  console.log('chart data', chartData)
  console.log('chart options', options)
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Click Distribution</h3>

        <div className="flex space-x-2 text-sm font-medium bg-gray-100 p-1 rounded">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-3 py-1 rounded transition-all ${view === tab
                ? 'bg-white shadow text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WeeklyChart;
