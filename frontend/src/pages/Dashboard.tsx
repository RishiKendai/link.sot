import React from 'react'
import Button from '../components/ui/button/Button'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className='flex flex-col gap-5'>
    <Button label='Create Link' className='gpb' onClick={() => navigate('/links/create')} isPending={false} />
    <div className='space-y-5'>
      <div className='min-h-24 bg-red-50 '>dashboard</div>
      <div className='min-h-24 bg-red-50 '>dashboard</div>
      <div className='min-h-24 bg-red-50 '>dashboard</div>
      <div className='min-h-24 bg-red-50 '>dashboard</div>
      <div className='min-h-24 bg-red-50 '>dashboard</div>
      <div className='min-h-24 bg-red-50 '>dashboard</div>
      <div className='min-h-24 bg-red-50 '>dashboard</div>
    </div>
    </div>
  )
}

export default Dashboard