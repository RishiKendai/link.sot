import React, { useEffect } from 'react'

import ChartLayout from '../../components/ui/charts/ChartLayout';
import HourlyChart from '../../components/ui/charts/HourlyChart';
import WeeklyChart from '../../components/ui/charts/WeeklyChart';
import { BrowserChart, DeviceChart, OSChart, WorldMapChart } from '../../components/ui/charts';
import type { LAnalyticType } from './types';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useParams } from 'react-router-dom';
import '../analytics/analytics.css'
import clsx from 'clsx';
import type { IconBaseProps } from '../../components/ui/icons/IconBase';
import IconLink from '../../components/ui/icons/IconLink';
import IconCalendar from '../../components/ui/icons/IconCalendar';
import { formatToHumanDate } from '../../utils/formateDate';
import IconClick from '../../components/ui/icons/IconClick';
import IconHandFinger from '../../components/ui/icons/IconHandFinger';
import IconUser from '../../components/ui/icons/IconUser';
import IconQrCode from '../../components/ui/icons/IconQrCode';
import IconGlobeWWW from '../../components/ui/icons/IconGlobeWWW';
import IconMapPin from '../../components/ui/icons/IconMapPin';
import IconDevice from '../../components/ui/icons/IconDevice';
import IconShield from '../../components/ui/icons/IconShield';
import Tooltip from '../../components/ui/Tooltip';
import IconShieldOff from '../../components/ui/icons/IconShieldOff';



const LinkAnalytics: React.FC = () => {
    const { id: uid } = useParams()
    const [analytics, setAnalytics] = React.useState<LAnalyticType | null>(null);

    const { data, isPending, isError } = useApiQuery<LAnalyticType>({
        path: `/links/analytics/${uid}`,
        key: ['link', 'analytics', uid],
    })

    useEffect(() => {
        if (data?.status === 'success' && data.data) {
            setAnalytics(data.data);
        }
    }, [data]);

    if (isError) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Failed to load analytics data</p>
            </div>
        );
    }
    return (
        <div className='w-full p-2 md:p-9'>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Analytics</h1>
                <p className="txt-2">Track your link performance and QR code usage</p>
            </div>
            {(isPending || !analytics)
                ? <Shimmer />
                : <>
                    <div className='db-layout-cards'>
                        <Card title='Total Clicks' value={analytics.total_clicks} Icon={IconHandFinger} wrapperClassName='gor' />
                        <Card title='QR Clicks' value={analytics.qr_clicks} Icon={IconQrCode} wrapperClassName='gct' />
                        <Card title='Direct Clicks' value={analytics.direct_clicks} Icon={IconClick} wrapperClassName='gpb' />
                        <Card title='Unique Visitors' value={analytics.unique_visitors} Icon={IconUser} wrapperClassName='gin' />
                    </div>

                    <div className="analytics-layout mb-8">
                        {/* Link Details */}
                        <LinkDetails link={analytics} />
                        {/* Last Click stats */}
                        <LastClickStats link={analytics} />
                    </div>

                    <div className="analytics-layout mb-8">
                        <ChartLayout label='Hourly Chart' children={<HourlyChart hourlyStats={analytics.hourly_stats} />} />
                        <ChartLayout label='Weekly Chart' children={<WeeklyChart weeklyStats={analytics.weekly_stats} dailyStats={analytics.daily_stats} monthlyStats={analytics.monthly_stats} />} />
                    </div>
                    <div className="analytics-layout mb-8">
                        <ChartLayout label='Platform Chart' children={<OSChart osStats={analytics.os_stats} />} />
                        <ChartLayout label='Device Chart' children={<DeviceChart deviceStats={analytics.device_stats} />} />
                    </div>
                    <div className="analytics-layout mb-8">
                        <ChartLayout label='Browser Chart' children={<BrowserChart browserStats={analytics.browser_stats} />} />
                        <ChartLayout label='Country Click HeatMap' children={<WorldMapChart geographicData={analytics.geographic_data} />} />
                    </div>
                </>
            }
        </div>
    )
}

export default LinkAnalytics


const Shimmer: React.FC = () => {
    return (
        <>
            <div className='db-layout-cards'>
                <div className='shimmer h-[160px] rounded-xl'></div>
                <div className='shimmer h-[160px] rounded-xl'></div>
                <div className='shimmer h-[160px] rounded-xl'></div>
                <div className='shimmer h-[160px] rounded-xl'></div>
            </div>
            <div className="h-[420px] analytics-layout mb-8 flex flex-col">
                <div className="shimmer rounded-2xl h-full"></div>
                <div className="shimmer rounded-2xl h-full"></div>
            </div>
        </>
    )
}

const LinkDetails: React.FC<{ link: LAnalyticType }> = ({ link }) => {
    return (
        <div className='polished-card p-5 flex flex-col space-y-8'>
            <h2 className='text-2xl font-semibold self-center'>Link Details</h2>
            <div className='flex space-y-6 flex-col'>
                <div className='bg-gray-100 rounded-full py-2 px-4 flex items-center gap-2 min-w-0'>
                    {
                        link.is_password_protected ?
                            <Tooltip text='Protected by password' dir='top'>
                                <span className='text-green-600 bg-green-200 rounded-full p-2 flex'>
                                    <IconShield size={20} />
                                </span>
                            </Tooltip>
                            :
                            <Tooltip text='Public' dir='top'>
                                <span className='text-red-600 bg-red-100 rounded-full p-2 flex'>
                                    <IconShieldOff size={20} />
                                </span>
                            </Tooltip>
                    }
                    <span className='w-fit max-w-full truncate text-lg font-bold'>
                        {link.full_short_link}
                    </span>
                </div>
                <StatsCard Icon={IconLink} title='Original URL' value={link.original_link} iconClass='gsbb' />
                <StatsCard Icon={IconCalendar} title='Created on' value={formatToHumanDate(link.created_on)} iconClass='gsbb' />
                <StatsCard Icon={IconCalendar} title='Expires on' value={formatToHumanDate(link.expiries_on)} iconClass='gsbb' />
            </div>
        </div>
    )
}

const LastClickStats: React.FC<{ link: LAnalyticType }> = ({ link }) => {
    return (
        <div className='polished-card p-5 flex flex-col space-y-8'>
            <h2 className='text-2xl font-semibold self-center'>Recent Click Stats</h2>
            <div className='overflow-hidden min-w-0 flex space-y-6 flex-col'>
                <StatsCard Icon={IconCalendar} iconClass='gct' title='Clicked on' value={formatToHumanDate(link.last_clicked_at) || 'N/A'} />
                <StatsCard Icon={IconGlobeWWW} iconClass='grc' title='Browser' value={link.last_click_browser || 'N/A'} />
                <StatsCard Icon={IconMapPin} iconClass='gpb' title='Location' value={link.last_click_from || 'N/A'} />
                <StatsCard Icon={IconDevice} iconClass='gin' title='Device' value={link.last_click_device || 'N/A'} />
            </div>
        </div>
    )
}


type CardProps = {
    title: string;
    value: string | number;
    Icon: React.FC<IconBaseProps>;
    wrapperClassName?: string
}

const Card: React.FC<CardProps> = ({ title, value, Icon, wrapperClassName }) => {
    return (
        <div className={clsx('relative h-[145px] rounded-xl flex gap-2 w-full p-5 select-none', wrapperClassName)}>
            <div className="glow-shadow"></div>
            <div className='w-full text-white'>
                <h5 className='text-xl font-semibold mb-3'>{title}</h5>
                <p className='text-5xl font-bold'>{value}</p>
            </div>
            <div className='text-white flex items-center'>
                <Icon size={52} className='icon-glow' />
            </div>
        </div >
    )
}


type StatsProps = {
    Icon: React.FC<IconBaseProps>;
    title: string;
    value: string;
    iconClass: string;
}

const StatsCard: React.FC<StatsProps> = ({ Icon, title, value, iconClass }) => {
    return (
        <div className='flex'>
            <span className={clsx('mr-4 p-2 rounded-2xl text-white flex items-center justify-center', iconClass)}>
                <Icon size={32} />
            </span>
            <div className='flex flex-col justify-center min-w-0'>
                <h5 className='w-fit max-w-full truncate text-lg font-bold'>{value}</h5>
                <p className='txt-2 text-sm'>{title}</p>
            </div>
        </div>
    );
}
