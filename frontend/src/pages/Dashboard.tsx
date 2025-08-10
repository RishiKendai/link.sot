import React, { useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import Button from '../components/ui/button/Button'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../context/UseAuth'

import IconClick from '../components/ui/icons/IconClick'
import type { IconBaseProps } from '../components/ui/icons/IconBase'
import IconQrCode from '../components/ui/icons/IconQrCode'
import IconUser from '../components/ui/icons/IconUser'
import IconGlobe from '../components/ui/icons/IconGlobe'
import IconArrowNarrowRight from '../components/ui/icons/IconArrowNarrowRight'
import IconMapPin from '../components/ui/icons/IconMapPin'
import IconCalendar from '../components/ui/icons/IconCalendar'
import IconDevice from '../components/ui/icons/IconDevice'
import IconGlobeWWW from '../components/ui/icons/IconGlobeWWW'

import './dashboard.css'

// Lazy-loaded
const IconCustomDomain = React.lazy(() => import('../components/ui/icons/IconCustomDomain'));
const IconAPIIntegration = React.lazy(() => import('../components/ui/icons/IconAPIIntegration'));
const LinkCard = React.lazy(() => import('../components/LinkCard'));

type DashboardData = {
  total_clicks: number;
  qr_clicks: number;
  direct_clicks: number;
  unique_visitors: number;
  stats: Stats;
}

type Stats = {
  user_uid: string;
  uid: string;
  expiry_date: Date;
  is_custom_backoff: boolean;
  is_flagged: boolean;
  created_at: Date;
  deleted: boolean;
  original_url: string;
  password: string;
  scan_link: boolean;
  short_link: string;
  tags: string[];
  top_browser: string;
  top_city: string;
  top_country: string;
  top_day_of_week: number;
  top_device: string;
  top_os: string;
  total_clicks: number;
  updated_at: Date;
  hide: string[];
}

const WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'N/A']
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const navigate = useNavigate()
  const [dState, setDState] = React.useState<DashboardData | null>(null);
  const { data, isPending, isError } = useApiQuery<DashboardData>({
    path: '/dashboard',
    key: ['dashboard']
  })

  useEffect(() => {
    if (data?.status === 'success' && data.data) {
      data.data.stats.hide = ['edit', 'delete']
      setDState(data.data)
    }
  }, [data])

  if (isError) {
    return <ErrorState />
  }

  const getCityCountry = (city: string, country: string) => {
    const c1 = city && city !== 'Unknown';
    const c2 = country && country !== 'Unknown';

    if (!c1 && !c2) return 'N/A';
    if (c1 && !c2) return city;
    if (!c1 && c2) return country;
    return `${city}, ${country}`;
  };

  const getOSDevice = (os: string, device: string) => {
    const o1 = os && os !== 'Unknown';
    const d1 = device && device !== 'Unknown';

    if (!o1 && !d1) return 'N/A';
    if (o1 && !d1) return os;
    if (!o1 && d1) return device;
    return `${os}, ${device}`
  }

  return (
    <div className='w-full p-2 px-4 md:p-9'>
      <div className='flex items-center justify-between mb-10'>
        <div>
          <h5 className='text-5xl font-black mb-4'>Dashboard</h5>
          {user?.name && <p className='text-gray-600 tex-xl'>Welcome back <span className='dynamic-txt-gradient gct font-extrabold italic'>{user?.name}</span></p>}
        </div>
        <Button label='Create Link' className='gpb' onClick={() => navigate('/links/create')} isPending={false} />
      </div>
      <section className='flex flex-col'>
        {isPending || !dState ? <ShimmerDashboard />
          : (
            <>
              <div className='db-layout-cards'>
                <Card title='Total Clicks' value={dState.total_clicks} Icon={IconGlobe} wrapperClassName='gor' />
                <Card title='QR Clicks' value={dState.qr_clicks} Icon={IconQrCode} wrapperClassName='gct' />
                <Card title='Direct Clicks' value={dState.direct_clicks} Icon={IconClick} wrapperClassName='gpb' />
                <Card title='Unique Visitors' value={dState.unique_visitors} Icon={IconUser} wrapperClassName='gin' />
              </div>
              <div className='db-layout--main'>
                <div className="db-layout--main-left">
                  {/* Link Container */}
                  <div className=" link-container">
                    <div className='flex items-center justify-between mb-3'>
                      <h5 className='text-2xl  font-bold'>Recent Links</h5>
                      <span className='text-gray-400 text-sm'>{dState.stats.uid ? '1' : '0'} Result</span>
                    </div>
                    {
                      dState.stats.uid ? (
                        <>
                          <LinkCard link={dState.stats} />
                          <div onClick={() => navigate('/links')} className='flex items-center justify-center py-2 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors'>
                            <span>See all links</span>
                            <IconArrowNarrowRight size={20} className='ml-2' />
                          </div>
                        </>
                      ) : (
                        <div className='flex flex-col text-center items-center justify-center h-full bg-[var(--empty-bg)] rounded-2xl p-8'>
                          <h5 className='text-2xl font-black mb-2'>Oops! Looks like you have no links yet.</h5>
                          <p className='text-gray-600 tex-xl mb-4'>Create a link by clicking the button below to get started.</p>
                          <Button label='Create new link' className='gpb' onClick={() => navigate('/links/create')} isPending={false} />
                        </div>
                      )
                    }

                  </div>
                  <div className=" analytics-container border-silver bg-white p-5 rounded-2xl">
                    <div className='flex items-center justify-between mb-4'>
                      <h5 className='text-xl font-semibold'>Recent Stats</h5>
                      <span className='text-gray-400 hover:text-gray-600 text-sm cursor-pointer' onClick={() => navigate('/analytics')}>View all</span>
                    </div>

                    <div className='space-y-4'>
                      <StatsCard Icon={IconGlobeWWW} iconClass='grc' title='Most popular browser' value={dState.stats.top_browser || 'N/A'} />
                      <StatsCard Icon={IconMapPin} iconClass='gpb' title='Leading country by traffic' value={getCityCountry(dState.stats.top_city, dState.stats.top_country)} />
                      <StatsCard Icon={IconCalendar} iconClass='gct' title='Peak day for visits' value={WEEK[dState.stats.top_day_of_week]} />
                      <StatsCard Icon={IconDevice} iconClass='gin' title='Primary device type' value={getOSDevice(dState.stats.top_os, dState.stats.top_device)} />
                    </div>
                  </div>
                </div>
                <div className="db-layout--main-right">
                  {/* Custom Domain */}
                  <div className='polished-card border-silver p-5 mb-4'>
                    <div className='flex items-center mb-4'>
                      <span className='mr-4 p-2 rounded-xl text-white flex items-center justify-center gsbb'>
                        <IconCustomDomain />
                      </span>
                      <h5 className='text-xl font-semibold'>Custom Domain</h5>
                    </div>
                    <p className='txt-2 text-sm'>Elevate your brand with a custom domain for your URL shortener. Use your company's domain to create professional, branded short links that build trust and recognition.</p>
                    <ul className="feature-list">
                      <li className="feature-item">Brand consistency across all shortened URLs</li>
                      <li className="feature-item">Custom subdomain setup (e.g., yourcompany.{URL_DOMAIN})</li>
                      <li className="feature-item">Professional appearance for your links</li>
                    </ul>
                    {/* <Button label='Contact Admin' className='gsbb' onClick={() => navigate('/settings/custom-domain')} isPending={false} /> */}
                    <span className='txt-2 text-sm'>To set this up for your company, please contact <a href={`mailto:query.linksot@gmail.com`} className='text-sky-400 hover:underline hover:text-blue-800 transition-colors'>admin</a> or mail to query.linksot@gmail.com</span>
                  </div>
                  {/* API Integration */}
                  <div className='polished-card border-silver p-5 flex flex-col'>
                    <div className='flex items-center mb-4'>
                      <span className='mr-4 p-2 rounded-xl text-white flex items-center justify-center gsbb'>
                        <IconAPIIntegration />
                      </span>
                      <h5 className='text-xl font-semibold'>API Integration</h5>
                    </div>
                    <p className='txt-2 text-sm'>Integrate URL shortening directly into your applications with our powerful API. Generate short URLs, access link data programmatically.</p>
                    <ul className="feature-list">
                      <li className="feature-item">Generate short URLs programmatically</li>
                      <li className="feature-item">Comprehensive documentation included</li>
                    </ul>
                    <Button label='Start Integrating' className='ml-auto gsbb' onClick={() => navigate('/settings')} isPending={false} />
                  </div>
                </div>
              </div>
            </>
          )
        }
      </section>
    </div>
  )
}

export default Dashboard


const ShimmerDashboard: React.FC = () => {
  return (
    <>
      <div className='db-layout-cards'>
        <div className='shimmer h-[160px] rounded-xl'></div>
        <div className='shimmer h-[160px] rounded-xl'></div>
        <div className='shimmer h-[160px] rounded-xl'></div>
        <div className='shimmer h-[160px] rounded-xl'></div>
      </div>
      <div className='db-layout--main'>
        <div className="db-layout--main-left">
          <div className="shimmer rounded-2xl link-container"></div>
          <div className="shimmer analytics-container"></div>
        </div>
        <div className="db-layout--main-right shimmer"></div>
      </div>
    </>
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
      <div className='flex flex-col justify-center'>
        <h5 className='text-lg font-bold'>{value}</h5>
        <p className='txt-2 text-sm'>{title}</p>
      </div>
    </div>
  );
}

const ErrorState: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <h5 className='text-5xl font-black mb-4'>Error</h5>
      <p className='text-gray-600 tex-xl'>There was an issue loading your dashboard. Please try refreshing the page.</p>
    </div>
  )
}