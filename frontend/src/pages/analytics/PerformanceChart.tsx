import React from 'react'
import type { TopPerformingLinkType } from './types'
import clsx from 'clsx'
import IconAnalytics from '../../components/ui/icons/IconAnalytics'


type PerformanceChartProps = {
    data: TopPerformingLinkType[]
}

const BASE_URL = import.meta.env.VITE_SOT_HOST

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
    return (
        <div className='border-silver rounded-2xl py-6 bg-[var(--bg-secondary)]'>
            <div className='flex justify-between items-center mb-6 px-6'>
                <h4 className='text-lg font-semibold'>Most Engaging Links</h4>
                <span className='text-sm txt-2 ml-4 text-nowrap'>{data.length} Result{`${data.length > 1 ? 's' : ''}`}</span>
            </div>
            <div className='px-6 analytics__card-y space-y-4'>
                {data.length > 0
                    ? data.map((item, index) => (
                        <Card key={index} data={item} index={index} />
                    ))
                    : <EmptyState />}
            </div>
        </div>
    )
}

export default PerformanceChart

const Card: React.FC<{ data: TopPerformingLinkType, index: number }> = ({ data, index }) => {
    return (
        <div
            className={clsx(
                'overflow-hidden flex flex-col justify-between p-4 rounded-xl transition-transform duration-200 bg-white',
                index === 0 && 'shadow-xl scale-[1.02] origin-top',
                index === 1 && 'shadow-md scale-[1.01] origin-top',
                index > 1 && 'shadow-sm'
            )}
        >
            <div className='w-full overflow-hidden'>
                <h4 className='text-lg font-semibold truncate'>{BASE_URL}/{data.short_link}</h4>
                <p className='text-xs txt-2 truncate'>{data.original_link}</p>
            </div>
            <div className="my-4 border-t border-t-[var(--clr-border)] w-full h-[1px]"></div>
            <div className='flex items-center gap-2 flex-wrap'>
                <span className='text-sm txt-2'>{data.total_clicks} Clicks</span>
                <span className='min-w-1 min-h-1 rounded-full bg-[var(--text-secondary)]'></span>
                <span className='text-sm txt-2'>{data.qr_clicks} Scans</span>
                <span className='min-w-1 min-h-1 rounded-full bg-[var(--text-secondary)]'></span>
                <span className='text-sm txt-2'>{data.direct_clicks} Direct Visits</span>
            </div>
        </div>
    )
}


const EmptyState: React.FC = () => {
    return (
        <div className='flex flex-col items-center justify-center py-12 px-6'>
            <div className='flex flex-col items-center justify-center space-y-4'>
                <div className='relative'>
                    <div className='w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center'>
                        <IconAnalytics 
                            size={32} 
                            color='#6366f1' 
                            strokeWidth={1.5}
                        />
                    </div>
                    <div className='absolute -top-1 -right-1 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center'>
                        <div className='w-3 h-3 bg-gray-400 rounded-full'></div>
                    </div>
                </div>
                <div className='text-center space-y-2'>
                    <h4 className='text-lg font-semibold text-gray-700'>No Analytics Data</h4>
                    <p className='text-sm text-gray-500 max-w-xs'>
                        Start creating links to see your most engaging content here
                    </p>
                </div>
                <div className='flex items-center space-x-2 text-xs text-gray-400'>
                    <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                    <span>Performance metrics will appear here</span>
                    <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                </div>
            </div>
        </div>
    )
}