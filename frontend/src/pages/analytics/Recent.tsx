import React from 'react'
import type { RecentActivityType } from './types'
import { formatToHumanDate } from '../../utils/formateDate'
import IconMapPin from '../../components/ui/icons/IconMapPin'
import IconDevice from '../../components/ui/icons/IconDevice'
import IconHandFinger from '../../components/ui/icons/IconHandFinger'

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
        {data.map((item, index) => (
          <Card key={index} data={item} />
        ))}
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
        <h4 className='text-lg font-semibold truncate'>{data.short_link}</h4>
        <p className='text-xs txt-2 truncate'>{data.original_link}</p>
      </div>
      {/* <div className="my-4 border-t border-t-[var(--clr-border)] w-full h-[1px]"></div> */}
      <div className='flex items-center space-x-4 flex-wrap bg-[var(--ice-silver)] p-2 rounded-md'>
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