import React, { useState } from 'react'

import './link.css'
import Button from '../components/ui/button/Button';
import { useNavigate } from 'react-router-dom';
import Searchbar from '../components/ui/inputs/Searchbar';
import IconLink from '../components/ui/icons/IconLink';
import { useApiQuery } from '../hooks/useApiQuery';
import Alert from '../components/ui/Alert';
import IconCopy from '../components/ui/icons/IconCopy';
import IconAnalytics from '../components/ui/icons/IconAnalytics';
import { formatToHumanDate } from '../utils/formateDate';
import IconEdit from '../components/ui/icons/IconEdit';
import IconDelete from '../components/ui/icons/IconDelete';
import IconExpiry from '../components/ui/icons/IconExpiry';
import IconShield from '../components/ui/icons/IconShield.tsx';
import IconShieldOff from '../components/ui/icons/IconShieldOff';
import Tooltip from '../components/ui/Tooltip';
import IconTick from '../components/ui/icons/IconTick';
import IconTag from '../components/ui/icons/IconTag';
import IconChevronLeft from '../components/ui/icons/IconChevronLeft.tsx';
import IconChevronRight from '../components/ui/icons/IconChevronRight.tsx';
import clsx from 'clsx'
import QRCodeGenerator from '../components/QRCodeGenerator';

// Import the ExpiryDate type from DatePicker
// https://www.google.com/s2/favicons?domain=${domain}&sz=${size}

type Link = {
    user_uid: string;
    uid: string;
    title: string;
    original_url: string;
    short_link: string;
    tags: string[];
    created_at: Date;
    expiry_date: Date;
    password: string;
    is_flagged: boolean;
    is_custom_backoff: boolean;
    updated_at: Date;
}

// const gradientList = ['gpb', 'gct', 'gge', 'gor']
const baseURL = import.meta.env.VITE_FRONTEND_LINK

const Link: React.FC = () => {
    const [links, setLinks] = useState<Link[]>([])
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const navigate = useNavigate()

    const handleSearch = (search: string) => {
        console.log(search)
    }

    const { data, isPending, isError } = useApiQuery<{
        links: Link[];
        total: number;
        page: number;
        page_size: number;
    }>({
        path: '/links',
        queryParams: { page, page_size: pageSize },
        key: ['links', page, pageSize],
    })

    // Update links when data changes
    React.useEffect(() => {
        if (data?.status === 'success' && data.data) {
            setLinks(data.data.links)
            setTotal(data.data.total)
            setPage(data.data.page)
            setPageSize(data.data.page_size)
        }
    }, [data])

    // Show error toast when there's an error
    React.useEffect(() => {
        if (isError) {
            setError('Something went wrong. Please try again later.')
            // Auto-hide error after 5 seconds
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [isError])

    const totalPages = Math.ceil(total / pageSize)

    // Helper to generate advanced pagination page numbers
    function getPageNumbers(current: number, total: number) {
        const pages: (number | string)[] = [];
        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            if (current <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', total);
            } else if (current >= total - 3) {
                pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
            } else {
                pages.push(1, '...', current - 1, current, current + 1, '...', total);
            }
        }
        return pages;
    }

    return (
        <div className='w-full p-2 md:p-9'>
            {/* Error Toast */}
            {error && (
                <div className='fixed top-4 right-4 z-50 max-w-sm'>
                    <Alert
                        type='danger'
                        message={error}
                        className='mb-4'
                    />
                </div>
            )}

            <div className='flex items-center justify-between mb-4 '>
                <div>
                    <h5 className='text-5xl font-black mb-4'>My Links</h5>
                    <p className='text-gray-600 tex-xl font-light'>All your cosmic short links in one place</p>
                </div>
                <Button label='Create Link' className='gpb' onClick={() => navigate('/links/create')} isPending={false} />

            </div>

            {/* All Links */}
            <section className='flex flex-col'>
                <Searchbar className='mb-6 mr-auto' placeholder='Search Links' onSearch={handleSearch} />

                <div className='flex flex-wrap w-full border-t border-gray-300 pt-12 gap-9'>
                    {/* Loading State */}
                    {isPending && (
                        <LinkShimmer count={3} />
                    )}

                    {/* Data State - Show links if available */}
                    {!isPending && !isError && links && links.length > 0 && (
                        <div className='flex flex-col w-full gap-9'>
                            <LinkCard links={links} />
                            {/* Pagination Controls */}
                            <div className='flex justify-center items-center gap-4 mt-8'>
                                <button
                                    className={clsx(
                                        'flex items-center text-base gap-2 px-2 py-2 rounded-lg border border-gray-300',
                                        { 'hover:bg-[var(--clr-tertiary)]/10': page !== 1 },
                                        { 'bg-gray-300 text-white': page === 1 },
                                        { 'bg-white text-gray-700': page !== 1 }
                                    )}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <IconChevronLeft size={22} />
                                </button>
                                <div className='flex gap-1'>
                                    {getPageNumbers(page, totalPages).map((p, idx) =>
                                        typeof p === 'number' ? (
                                            <button
                                                key={p}
                                                className={clsx(
                                                    'min-w-9 h-9 px-2 rounded-lg flex items-center justify-center text-base font-bold border border-gray-300',
                                                    {
                                                        'bg-[var(--clr-secondary)] text-white': p === page,
                                                        'hover:bg-[var(--clr-tertiary)]/10 text-gray-700': p !== page,
                                                        'bg-white text-[var(--clr-tertiary)]': p !== page
                                                    }
                                                )}
                                                onClick={() => setPage(p)}
                                                disabled={p === page}
                                            >
                                                {p}
                                            </button>
                                        ) : (
                                            <span key={idx} className='w-9 h-9 flex items-center justify-center text-gray-400'>
                                                ...
                                            </span>
                                        )
                                    )}
                                </div>
                                <button
                                    className={clsx(
                                        'flex items-center text-base gap-2 px-2 py-2 rounded-lg border border-gray-300',
                                        { 'hover:bg-[var(--clr-tertiary)]/10': page !== totalPages },
                                        { 'bg-gray-300 text-white': page === totalPages },
                                        { 'bg-white text-gray-700': page !== totalPages }
                                    )}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <IconChevronRight size={22} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty State - Show when no data or error */}
                    {!isPending && (!links || links.length === 0) && (
                        <div className='flex items-center justify-center h-full p-8 flex-col text-center w-full'>
                            <IconLink className='text-gray-400 mb-8 rotate-45' size={100} />
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                {isError ? 'Unable to Load Links' : 'No Short Links Yet!'}
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                {isError
                                    ? 'There was an issue loading your links. Please try refreshing the page.'
                                    : "It looks like you haven't created any short links. Use the section above to get started!"
                                }
                            </p>
                            <Button
                                label={isError ? 'Try Again' : 'Create Short Link'}
                                className='gpb'
                                onClick={() => isError ? window.location.reload() : navigate('/links/create')}
                                isPending={false}
                            />
                        </div>
                    )}

                </div>
            </section>
        </div>
    )
}

export default Link


type LinkCardProps = {
    links: Link[]
}

const LinkCard = ({ links }: LinkCardProps) => {
    const navigate = useNavigate()
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
    return (
        links.map((link) => {
            const host = new URL(link.original_url).host
            return (
                <div key={link.uid} className='relative flex bg-white rounded-2xl border border-[var(--clr-tertiary)]/15 w-full p-6'>
                    <div>
                        {/* favIcon */}
                        <div className="flex items-center gap-2 w-8 h-8 mr-4">
                            <img src={`https://www.google.com/s2/favicons?sz=64&domain=${host}`} alt="Favicon" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className='w-full'>
                        <div className="flex mb-8 w-full">
                            {/* date, title/original_url, short_link */}
                            <div className="flex flex-col w-full mr-4">
                                <p className="w-fit text-gray-400 text-sm font-medium mb-1">{formatToHumanDate(link.created_at.toString())}</p>
                                <p className="w-fit text-[var(--text-primary)] text-lg font-bold truncate">{baseURL}/{link.short_link}</p>
                                <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="w-fit text-sm truncate text-blue-500 hover:underline hover:text-blue-600 underline-offset-3">{link.title || link.original_url}</a>
                            </div>

                            {/* menu items */}
                            <div className="flex items-start gap-2 ml-auto">
                                {/* Copy */}
                                <div
                                    className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 border border-gray-200 relative group'
                                    onClick={() => {
                                        navigator.clipboard.writeText(baseURL + '/' + link.short_link)
                                        setCopiedLinkId(link.uid)
                                        setTimeout(() => {
                                            setCopiedLinkId(null)
                                        }, 2000)
                                    }}
                                >
                                    {copiedLinkId === link.uid ? (
                                        <IconTick size={18} />
                                    ) : (
                                        <IconCopy size={18} />
                                    )}
                                    {/* tooltip */}
                                    <Tooltip text='Copy' dir='bottom' />
                                </div>
                                {/* Edit */}
                                <div onClick={() => navigate(`/links/edit/${link.short_link}`)} className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 border border-gray-200 relative group'>
                                    <IconEdit size={18} />
                                    <Tooltip text='Edit' dir='bottom' />
                                </div>
                                {/* Delete */}
                                <div className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-red-100 border border-red-200 relative group'>
                                    <IconDelete size={18} color='red' />
                                    <Tooltip text='Delete' dir='bottom' />
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-between items-center'>
                            <div className='flex flex-wrap items-center gap-4'>
                                {/* Analytics */}
                                <div className='flex items-center gap-2 cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-colors' onClick={() => navigate(`/links/analytics/${link.uid}`)}>
                                    <IconAnalytics size={16} color='blue' />
                                    <p className='text-blue-700 text-sm font-semibold'>View Analytics</p>
                                </div>
                                {/* expiry date */}
                                <div className='flex items-center gap-1 relative group'>
                                    <IconExpiry size={18} className='text-gray-400' />
                                    <p className='text-gray-400 text-sm font-medium'>{formatToHumanDate(link.expiry_date.toString())}</p>
                                    {/* tooltip */}
                                    <Tooltip text='Expires on' dir='bottom' />
                                </div>
                                {/* is password protected */}
                                <div className='flex items-center gap-1'>
                                    {link.password ? (
                                        <>
                                            <IconShield size={18} color='green' />
                                            <p className='text-green-600 text-sm font-medium'>Password Protected</p>
                                        </>
                                    ) : (
                                        <>
                                            <IconShieldOff size={18} color='gray' />
                                            <p className='text-gray-500 text-sm font-medium'>Public</p>
                                        </>
                                    )}
                                </div>
                                {/* tags */}
                                {
                                    link.tags && link.tags.length > 0 && (
                                        <div className='flex items-center'>
                                            <IconTag size={18} className='mr-1 text-gray-400' />
                                            <div className='flex items-center gap-1 flex-wrap'>
                                                {link.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className='text-gray-400 text-xs font-medium bg-gray-100 px-2 py-1 rounded-md'>
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {link.tags.length > 3 && (
                                                    <span className='text-gray-400 text-xs font-medium'>
                                                        +{link.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                            <div>
                                {/* qr code */}
                                <QRCodeGenerator 
                                    url={`${baseURL}/r/${link.short_link}?r=qr`}
                                    size={48}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    isQR={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
        })
    )
}


type LinkShimmerProps = {
    count: number;
}

const LinkShimmer: React.FC<LinkShimmerProps> = ({ count }) => {
    return (
        <div className='flex flex-col w-full gap-9'>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className='relative flex bg-white rounded-2xl border border-[var(--clr-tertiary)]/15 w-full p-6'>
                    <div>
                        {/* favIcon skeleton */}
                        <div className="flex items-center gap-2 w-8 h-8 mr-4">
                            <div className="w-full h-full shimmer rounded-md"></div>
                        </div>
                    </div>
                    <div className='w-full'>
                        <div className="flex mb-8 w-full">
                            {/* date, title/original_url, short_link skeleton */}
                            <div className="flex flex-col w-full mr-4">
                                <div className="w-24 h-4 shimmer rounded mb-1"></div>
                                <div className="w-48 h-6 shimmer rounded mb-1"></div>
                                <div className="w-64 h-4 shimmer rounded"></div>
                            </div>

                            {/* menu items skeleton */}
                            <div className="flex items-start gap-2 ml-auto">
                                <div className='w-8 h-8 shimmer rounded-md'></div>
                                <div className='w-8 h-8 shimmer rounded-md'></div>
                                <div className='w-8 h-8 shimmer rounded-md'></div>
                            </div>
                        </div>
                        <div className='flex justify-between items-center'>
                            <div className='flex flex-wrap items-center gap-4'>
                                {/* Analytics skeleton */}
                                <div className='w-32 h-8 shimmer rounded-lg'></div>
                                {/* expiry date skeleton */}
                                <div className='w-24 h-6 shimmer rounded'></div>
                                {/* password protection skeleton */}
                                <div className='w-32 h-6 shimmer rounded'></div>
                                {/* tags skeleton */}
                                <div className='flex items-center gap-1'>
                                    <div className='w-4 h-4 shimmer rounded'></div>
                                    <div className='flex items-center gap-1'>
                                        <div className='w-12 h-5 shimmer rounded'></div>
                                        <div className='w-10 h-5 shimmer rounded'></div>
                                        <div className='w-8 h-5 shimmer rounded'></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                {/* qr code skeleton */}
                                <div className='w-12 h-12 shimmer rounded'></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
