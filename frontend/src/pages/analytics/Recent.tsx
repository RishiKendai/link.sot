import React from 'react'
import type { RecentActivityType } from './types'
import { formatToHumanDate } from '../../utils/formateDate'
import IconMapPin from '../../components/ui/icons/IconMapPin'
import IconDevice from '../../components/ui/icons/IconDevice'
import IconHandFinger from '../../components/ui/icons/IconHandFinger'
import IconClock from '../../components/ui/icons/IconClock'

type RecentProps = {
  data: RecentActivityType[]
}
const Recent: React.FC<RecentProps> = ({ data }) => {
  return (
    <div className='border-silver rounded-2xl py-6 bg-[var(--bg-secondary)]'>
      <div className='flex justify-between items-center mb-6 px-6'>
        <h4 className='text-lg font-semibold'>Recent Activity</h4>
        <span className='text-sm txt-2 ml-4 text-nowrap'>{data.length} Result{`${data.length > 1 ? 's' : ''}`}</span>
      </div>
      <div className='px-6 analytics__card-y space-y-4'>
        {data.length > 0
          ? data.map((item, index) => (
              <Card key={index} data={item} />
            ))
          : <EmptyState />}
      </div>
    </div>
  )
}

export default Recent

const Card: React.FC<{ data: RecentActivityType }> = ({ data }) => {
  return (
    <div className='overflow-hidden flex flex-col justify-between p-4 rounded-xl transition-transform duration-200 bg-white'>
      <span className='text-xs txt-2 mb-1'>{formatToHumanDate(data.click_time)}</span>
      <div className='w-full overflow-hidden mb-6'>
        <h4 className='text-lg font-semibold truncate'>{data.full_short_link}</h4>
        <p className='text-xs txt-2 truncate'>{data.original_link}</p>
      </div>
      <div className='flex items-center flex-wrap gap-4 bg-[var(--ice-silver)] p-2 rounded-md'>
        <div className='flex items-center'>
          <IconMapPin className='mr-1' size={18} />
          <span className='text-xs'>{data.location}</span>
        </div>
        <div className='flex items-center'>
          <IconDevice className='mr-1' size={18} />
          <span className='text-xs'>{data.device}</span>
        </div>
        <div className='flex items-center'>
          <IconHandFinger className='mr-1' size={18} />
          <span className='text-xs'>{data.device}</span>
        </div>
      </div>
    </div>
  )
}

const EmptyState: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center py-12 px-6'>
      <div className='flex flex-col items-center justify-center space-y-4'>
        <div className='relative'>
          <div className='w-16 h-16 bg-gradient-to-br from-orange-50 to-amber-100 rounded-full flex items-center justify-center'>
            <IconClock 
              size={32} 
              color='#f59e0b' 
              strokeWidth={1.5}
            />
          </div>
          <div className='absolute -top-1 -right-1 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center'>
            <div className='w-3 h-3 bg-gray-400 rounded-full'></div>
          </div>
        </div>
        <div className='text-center space-y-2'>
          <h4 className='text-lg font-semibold text-gray-700'>No Recent Activity</h4>
          <p className='text-sm text-gray-500 max-w-xs'>
            Your recent link clicks and interactions will appear here
          </p>
        </div>
        <div className='flex items-center space-x-2 text-xs text-gray-400'>
          <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
          <span>Activity feed will update in real-time</span>
          <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
        </div>
      </div>
    </div>
  )
}