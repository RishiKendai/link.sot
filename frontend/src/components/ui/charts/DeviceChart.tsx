import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import IconDevice from '../icons/IconDevice';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

interface DeviceChartProps {
  deviceStats: Record<string, number>;
}

const DeviceChart: React.FC<DeviceChartProps> = ({ deviceStats }) => {
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
    labels: Object.keys(deviceStats),
    datasets: [
      {
        data: Object.values(deviceStats),
        backgroundColor: colors.slice(0, Object.keys(deviceStats).length),
        borderColor: colors.slice(0, Object.keys(deviceStats).length).map(color => color + '80'),
        borderWidth: 2,
        hoverOffset: 4,
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
          label: function(context: import('chart.js').TooltipItem<'pie'>) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  const hasData = Object.keys(deviceStats).length > 0 && Object.values(deviceStats).some(value => value > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full">
      <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
      <div className="h-64">
        {hasData ? (
          <Pie data={data} options={options} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center h-full py-8'>
      <div className='flex flex-col items-center justify-center space-y-4'>
        <div className='relative'>
          <div className='w-16 h-16 bg-gradient-to-br from-purple-50 to-violet-100 rounded-full flex items-center justify-center'>
            <IconDevice 
              size={32} 
              color='#7c3aed' 
              strokeWidth={1.5}
            />
          </div>
          <div className='absolute -top-1 -right-1 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center'>
            <div className='w-3 h-3 bg-gray-400 rounded-full'></div>
          </div>
        </div>
        <div className='text-center space-y-2'>
          <h4 className='text-lg font-semibold text-gray-700'>No Device Data</h4>
          <p className='text-sm text-gray-500 max-w-xs'>
            Device usage statistics will appear here when visitors access your links
          </p>
        </div>
        <div className='flex items-center space-x-2 text-xs text-gray-400'>
          <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
          <span>Desktop, Mobile, Tablet, and more</span>
          <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
        </div>
      </div>
    </div>
  )
}

export default DeviceChart; 