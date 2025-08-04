import React, { useEffect, useState } from 'react';
import { useApiQuery } from '../../hooks/useApiQuery';
import clsx from 'clsx';

import './Shimmer'
import type { AnalyticsType } from './types';
import Shimmer from './Shimmer';
import PerformanceChart from './PerformanceChart';
import Recent from './Recent';
import './analytics.css'
import ChartLayout from '../../components/ui/charts/ChartLayout';
import HourlyChart from '../../components/ui/charts/HourlyChart';
import WeeklyChart from '../../components/ui/charts/WeeklyChart';
import { BrowserChart, DeviceChart, OSChart, WorldMapChart } from '../../components/ui/charts';

const Analytics: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
    const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);

    const { data, isPending, isError } = useApiQuery<AnalyticsType>({
        path: '/analytics',
        queryParams: {
            start_date: selectedPeriod === '7d'
                ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                : selectedPeriod === '30d'
                    ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0]
        },
        key: ['analytics', selectedPeriod],
    });

    useEffect(() => {
        if (data?.status === 'success' && data.data) {
            console.log('data found', data.data);
console.log('daily weekly monthly', data.data.analytics_stats.daily_stats, data.data.analytics_stats.weekly_stats, data.data.analytics_stats.monthly_stats);
            setAnalytics(data.data);
        }
    }, [data])

    if (isPending || !analytics) {
        return <Shimmer />;
    }

    if (isError) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Failed to load analytics data</p>
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-9">
            <div className="mb-4">
                <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="txt-2">Track your link performance and QR code usage</p>
            </div>

            {/* Period Selector */}
            <div className="mb-8">
                <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={clsx(
                                'px-4 text-sm py-2 rounded-full font-medium transition-colors',
                                selectedPeriod === period
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            )}
                        >
                            {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                        </button>
                    ))}
                </div>
            </div>

            <div className='analytics-layout mb-8'>
                <PerformanceChart data={analytics.top_performing_links} />
                <Recent data={analytics.recent_activity} />
            </div>

            <div className="analytics-layout mb-8">
                <ChartLayout label='Hourly Chart' children={<HourlyChart hourlyStats={analytics.analytics_stats.hourly_stats} />} />
                <ChartLayout label='Weekly Chart' children={<WeeklyChart weeklyStats={analytics.analytics_stats.weekly_stats} dailyStats={analytics.analytics_stats.daily_stats} monthlyStats={analytics.analytics_stats.monthly_stats} />} />
            </div>
            <div className="analytics-layout mb-8">
                <ChartLayout label='Platform Chart' children={<OSChart osStats={analytics.analytics_stats.os_stats} />} />
                <ChartLayout label='Device Chart' children={<DeviceChart deviceStats={analytics.analytics_stats.device_stats} />} />
            </div>
            <div className="analytics-layout mb-8">
                <ChartLayout label='Browser Chart' children={<BrowserChart browserStats={analytics.analytics_stats.browser_stats} />} />
                <ChartLayout  label='Country Click HeatMap' children={<WorldMapChart geographicData={analytics.analytics_stats.geographic_data} />} />
            </div>
        </div>
    );
};

export default Analytics

