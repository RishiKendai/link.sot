import React from 'react'
import type { TopPerformingLinkType } from './types'
import clsx from 'clsx'


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
                {data.map((item, index) => (
                    <Card key={index} data={item} index={index} />
                ))}
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
