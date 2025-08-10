import React, { useEffect, useState } from 'react'

import './link.css'
import Button from '../../components/ui/button/Button.tsx';
import { useNavigate } from 'react-router-dom';
import Searchbar from '../../components/ui/inputs/Searchbar.tsx';
import IconLink from '../../components/ui/icons/IconLink.tsx';
import { useApiQuery } from '../../hooks/useApiQuery.ts';
import Alert from '../../components/ui/Alert.tsx';
import IconChevronLeft from '../../components/ui/icons/IconChevronLeft.tsx';
import IconChevronRight from '../../components/ui/icons/IconChevronRight.tsx';
import clsx from 'clsx'
import LinkCard from '../../components/LinkCard.tsx';
import { useApiMutation } from '../../hooks/useApiMutation.ts';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal.tsx';

// Import the ExpiryDate type from DatePicker
// https://www.google.com/s2/favicons?domain=${domain}&sz=${size}

type Link = {
    user_uid: string;
    uid: string;
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

const baseURL = import.meta.env.VITE_SOT_HOST

const Link: React.FC = () => {
    const queryClient = useQueryClient()

    const [links, setLinks] = useState<Link[]>([])
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [linkId, setLinkId] = useState('')
    const navigate = useNavigate()


    const { mutate: deleteLink, isPending: isDeleting } = useApiMutation(['delete-link'])

    const handleSearch = (search: string) => {
        setSearch(search)
        setPage(1)
        setIsSearching(!!search)
    }

    // Fetch links (default or search)
    const { data, isPending, isError } = useApiQuery<{
        links: Link[];
        total: number;
        page: number;
        page_size: number;
    }>({
        path: isSearching ? '/links/search' : '/links',
        queryParams: isSearching
            ? { q: search, page, page_size: pageSize }
            : { page, page_size: pageSize },
        key: [isSearching ? 'links-search' : 'links', search, page, pageSize],
    })

    // Update links when data changes
    useEffect(() => {
        if (data?.status === 'success' && data.data) {
            setLinks(data.data.links)
            setTotal(data.data.total)
            setPage(data.data.page)
            setPageSize(data.data.page_size)
        }
    }, [data])

    // Show error toast when there's an error
    useEffect(() => {
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

    const deleteLinkHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        deleteLink({
            path: `/links/${linkId}`,
            method: 'DELETE',
        }, {
            onSuccess: (data) => {
                if (data.status === 'success') {
                    setLinkId('')
                    queryClient.invalidateQueries({ queryKey: ['links'] })
                    queryClient.invalidateQueries({ queryKey: ['links-search'] })

                    toast.success("Link deleted successfully")
                } else if (data.status === 'error') {
                    setLinkId('')
                    toast.error("Failed to delete link")
                    console.error('Failed to delete link:: ', data.error)

                }
            },
            onError: (err: unknown) => {
                console.log('err :::: ', err)
                setLinkId('')
                toast.error('Failed to delete link')
            }
        })
    }

    return (
        <>
            <div className='w-full p-3 md:p-9 md:red-500'>
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
                        {isPending && (<LinkShimmer count={3} />)}

                        {/* Data State - Show links if available */}
                        {!isPending && !isError && links && links.length > 0 && (
                            <div className='flex flex-col w-full gap-9'>
                                {links.map((link) => (
                                    <LinkCard key={link.uid} link={link} setLinkId={setLinkId} />
                                ))}

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
                                    {isError
                                        ? 'Unable to Load Links'
                                        : isSearching
                                            ? 'No links found for your search.'
                                            : 'No Short Links Yet!'}
                                </h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    {isError
                                        ? 'There was an issue loading your links. Please try refreshing the page.'
                                        : isSearching
                                            ? 'Try a different search term or create a new short link.'
                                            : "It looks like you haven't created any short links. Click the button below to get started!"}
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
            <Modal isOpen={linkId !== ''} onClose={() => setLinkId('')}>
                <form onSubmit={deleteLinkHandler}>
                    <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                    <p className="text-gray-600 mb-4">Are you sure you want to delete <span className='font-semibold text-red-800'>{`${baseURL}/${linkId}`}</span>?</p>
                    <div className="flex justify-end">
                        <Button
                            variant='tertiary'
                            label="Cancel"
                            type='button'
                            className='mr-2'
                            onClick={() => setLinkId('')}
                        />
                        <Button
                            label="Delete"
                            variant='danger-primary'
                            type='submit'
                            autoFocus={true}
                            className=''
                            isPending={isDeleting}
                        />
                    </div>
                </form>
            </Modal>
        </>
    )
}

export default Link



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
