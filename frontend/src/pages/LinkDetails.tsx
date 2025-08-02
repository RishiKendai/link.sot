import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApiQuery } from '../hooks/useApiQuery';
import IconChevronLeft from '../components/ui/icons/IconChevronLeft';
import Alert from '../components/ui/Alert';
import LinkCard from '../components/LinkCard';

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
    hide: string[];
}

const LinkDetails: React.FC = () => {
    const { id: urlId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const status = location.state?.status || 'NONE'

    const [link, setLink] = useState<Link | null>(null)


    const { data, isPending, isError } = useApiQuery<Link>({
        path: `/links/${urlId}`,
        key: ['link', 'details', status, urlId],
    })

    useEffect(() => {
        console.log('data', data)
        if (data?.status === 'success' && data.data) {
            console.log('data', data.data)
            data.data.hide = ['edit', 'delete']
            setLink(data.data)
        }
    }, [data])

    if (isError) {
        return (
            <div className='flex flex-col items-center justify-center h-screen'>
                <h1 className='text-2xl font-bold'>Something went wrong</h1>
                <p className='text-gray-500'>Please try again later</p>
                <button className='btn btn-primary' onClick={() => navigate(-1)}>Go back</button>
            </div>
        )
    }

    return (
        <section className='w-full min-h-screen py-8 px-5 flex flex-col'>
            {
                isError ?
                    <LinkError />
                    : (
                        <div>
                            <h2 className='text-2xl font-bold text-gray-900 mb-8'>Link Details</h2>
                            <span className='flex items-center text-gray-500 hover:text-gray-700 cursor-pointer w-fit mb-6' onClick={() => navigate('/links', { replace: true })}>
                                <IconChevronLeft className='mr-1' size={18} />
                                <span className='text-sm font-semibold'>Back to all links</span>
                            </span>
                            {
                                isPending || !link ?
                                    <LinkShimmer />
                                    : (
                                        <>
                                            {status === 'CREATED' && <Alert type='success' className='mb-6' message='Link created successfully!' />}
                                            {status === 'UPDATED' && <Alert type='success' className='mb-6' message='Link updated successfully!' />}
                                           <LinkCard link={link}  />
                                        </>
                                    )
                            }
                        </div>
                    )
            }
        </section>
    )
}

export default LinkDetails

const LinkError: React.FC = () => {
    return (
        <div>
            <h1>Something went wrong</h1>
        </div>
    )
}

const LinkShimmer: React.FC = () => {
    return (
        <>
            <div className='w-full shimmer min-h-11 rounded-xl mb-6'></div>
            {/* <Alert type='success' message='Link created successfully' className='mb-6' /> */}
            <div className='h-48 relative shimmer flex bg-white rounded-2xl border border-[var(--clr-tertiary)]/15 w-full p-6'>
            </div>
        </>
    )
}