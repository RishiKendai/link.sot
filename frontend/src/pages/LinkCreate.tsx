import React, { useState } from 'react'

import TextBox from '../components/ui/inputs/TextBox'
import Button from '../components/ui/button/Button'
import DatePicker from '../components/ui/datepicker/DatePicker'
import IconCalendar from '../components/ui/icons/IconCalendar'
import Checkbox from '../components/ui/inputs/Checkbox'
import ChipInput from '../components/ui/inputs/ChipInput'
import { useApiMutation } from '../hooks/useApiMutation'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/ui/Alert'

const LinkCreate = () => {
    const [url, setUrl] = useState('')
    const [customBackHalf, setCustomBackHalf] = useState('')
    const [expiryDate, setExpiryDate] = useState<Date | undefined>()
    const [showCalendar, setShowCalendar] = useState(false)
    const [scanLink, setScanLink] = useState(false)
    const [password, setPassword] = useState('')
    const [tags, setTags] = useState<string[]>([])

    const navigate = useNavigate();
    const { mutate: createLink } = useApiMutation(['create-link']);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [createdShortLink, setCreatedShortLink] = useState('');

    // Helper function to format date for display
    const formatExpiryDateForDisplay = (expiryDate: Date | undefined): string => {
        if (!expiryDate) return '';
        const date = expiryDate
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${day}-${month}-${year} - ${hours}:${minutes}`
    };

    const baseURL = import.meta.env.VITE_FRONTEND_URL

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        createLink({
            path: '/api/v1/links',
            method: 'POST',
            payload: {
                original_url: url,
                custom_backoff: customBackHalf,
                expiry_date: expiryDate ? expiryDate.toISOString() : undefined,
                password: password || undefined,
                scan_link: scanLink,
                tags: tags,
            },
        }, {
            onSuccess: (res: unknown) => {
                if (typeof res === 'object' && res !== null && 'status' in res && res.status === 'success' && 'data' in res && res.data && typeof res.data === 'object' && 'short_link' in res.data) {
                    setCreatedShortLink((res.data as { short_link: string }).short_link);
                    setShowModal(true);
                    setTimeout(() => {
                        setShowModal(false);
                        navigate('/links');
                    }, 2500);
                } else if (typeof res === 'object' && res !== null && 'message' in res && typeof (res as { message?: unknown }).message === 'string') {
                    setError((res as { message?: string }).message || 'Failed to create link.');
                } else {
                    setError('Failed to create link.');
                }
            },
            onError: (err: unknown) => {
                if (typeof err === 'object' && err !== null && 'error' in err && typeof (err as { error?: unknown }).error === 'string') {
                    setError((err as { error?: string }).error || 'Something went wrong. Please try again.');
                } else {
                    setError('Something went wrong. Please try again.');
                }
            },
        });
    }

    return (
        <section className='flex flex-col p-8 rounded-md w-full'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>Create a New Short Link</h2>
            <form onSubmit={handleSubmit}>
                <div className='flex flex-col w-full space-y-7'>
                    <TextBox
                        label='Original URL'
                        name='url'
                        type='url'
                        placeholder='https://www.example.com'
                        id='url'
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />

                    {/* Custom back-half */}
                    <div className='flex items-end gap-2 w-full'>
                        <TextBox
                            label='Custom Back-Half'
                            name='custom-back-half'
                            type='text'
                            placeholder='custom-back-half'
                            id='custom-back-half-base'
                            value={baseURL}
                            className='text-gray-400'
                            disabled
                        />
                        <span className='text-black leading-6 py-2'>/</span>
                        <TextBox
                            name='custom-back-half'
                            type='text'
                            placeholder='custom-back-half'
                            id='custom-back-half'
                            value={customBackHalf}
                            wrapperClass='w-1/2'
                            onChange={(e) => setCustomBackHalf(e.target.value)}
                        />
                    </div>


                    {/* Expiry date, password, and protection */}
                    <div className='grid grid-cols-2 gap-8'>
                        <div className='flex flex-col gap-8 relative'>
                            <TextBox
                                onClick={() => setShowCalendar(true)}
                                label='Expiry Date (Optional)'
                                name='expiry-date'
                                type='text'
                                placeholder='DD-MM-YYYY - HH:MM'
                                id='expiry-date'
                                value={formatExpiryDateForDisplay(expiryDate)}
                                readOnly={true}
                                postfixIcon={<IconCalendar className='text-gray-600' />}
                            />
                            {showCalendar && (
                                <DatePicker
                                    showCalendar={showCalendar}
                                    setShowCalendar={setShowCalendar}
                                    setExpiryDate={setExpiryDate}
                                    expiryDate={expiryDate}
                                />
                            )}
                            <Checkbox
                                label='Enable Protection (Auto scan for malicious email)'
                                id='scan-link'
                                checked={scanLink}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScanLink(e.target.checked)}
                            />
                        </div>
                        <div className='flex flex-col gap-3'>
                            <TextBox
                                label='Password (Optional)'
                                name='password'
                                type='text'
                                id='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Enter password'
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <ChipInput
                        label='Tags (Optional)'
                        name='tags'
                        placeholder='Add tags...'
                        initialValues={tags}
                        onValuesChange={setTags}
                        maxChips={10}
                    />

                    {error && <Alert type='danger' message={error} className='mb-4' />}
                    <div className='flex w-full justify-end'>
                        <Button className='text-sm mr-4' label='Cancel' type='button' variant='tertiary' />
                        <Button className='text-sm ' isPending={false} label='Shorten Link' type='submit' variant='primary' />
                    </div>
                </div>
            </form>
            {showModal && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50'>
                    <div className='bg-white p-8 rounded-lg shadow-lg flex flex-col items-center'>
                        <h3 className='text-lg font-bold mb-2'>Link Created!</h3>
                        <p className='mb-4'>Your new short link:</p>
                        <a href={createdShortLink} target="_blank" rel="noopener noreferrer" className='text-blue-600 underline break-all'>{createdShortLink}</a>
                        <Button label='Close' className='mt-4' isPending={false} onClick={() => { setShowModal(false); navigate('/links') }} />
                    </div>
                </div>
            )}
            {/* {error && <div className='text-red-600 mt-4'>{error}</div>} */}

        </section>
    )
}

export default LinkCreate