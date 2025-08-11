import React, { useState } from 'react'

import TextBox from '../../components/ui/inputs/TextBox'
import Button from '../../components/ui/button/Button'
import DatePicker from '../../components/ui/datepicker/DatePicker'
import IconCalendar from '../../components/ui/icons/IconCalendar'
import ChipInput from '../../components/ui/inputs/ChipInput'
import { useApiMutation } from '../../hooks/useApiMutation'
import { useNavigate } from 'react-router-dom'
import Alert from '../../components/ui/Alert'
import { useQueryClient } from '@tanstack/react-query'
import { validateField } from '../../utils/validation'

const LinkCreate = () => {
    const [url, setUrl] = useState('')
    const [customBackHalf, setCustomBackHalf] = useState('')
    const [expiryDate, setExpiryDate] = useState<Date | undefined>()
    const [showCalendar, setShowCalendar] = useState(false)
    const [password, setPassword] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [formError, setFormError] = useState<Record<string, string>>({})

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mutate: createLink } = useApiMutation(['create-link']);
    const [error, setError] = useState('');

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

    const baseURL = import.meta.env.VITE_APP_DOMAIN

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const originalURL = validateField({ name: 'url', value: url, type: 'url', setError: setFormError })
        if (!originalURL) return;
        setFormError({});
        setError('');
        createLink({
            path: '/links',
            method: 'POST',
            payload: {
                original_url: url,
                custom_backoff: customBackHalf,
                expiry_date: expiryDate ? expiryDate.toISOString() : undefined,
                password: password || undefined,
                tags: tags,
            },
        }, {
            onSuccess: (res: unknown) => {
                if (typeof res === 'object' && res !== null && 'status' in res && res.status === 'success' && 'data' in res && res.data && typeof res.data === 'object' && 'short_code' in res.data) {
                    queryClient.invalidateQueries({ queryKey: ['links'] })
                    navigate(`/links/${(res.data as { short_code: string }).short_code}/details`, { state: { status: 'CREATED' }, replace: true });
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
        <section className='min-h-screen flex flex-col py-8 w-full'>
            <form onSubmit={handleSubmit}>
                <div className='flex flex-col w-full space-y-7 px-2 md:px-8 max-w-5xl justify-self-center'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-6'>Create a New Short Link</h2>
                    <div className="group-fields card-group w-full">
                        <div className='card-item'>
                            <TextBox
                                label='Original URL'
                                name='url'
                                type='url'
                                placeholder='https://www.example.com'
                                id='url'
                                value={url}
                                error={formError.url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>

                        {/* Custom back-half */}
                        <div className='card-item'>
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
                                    wrapperClass='w-full'
                                    onChange={(e) => setCustomBackHalf(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <h5 className='text-lg font-semibold text-gray-900 mb-4'>Advanced Settings</h5>
                    {/* Expiry date, password, and protection */}
                    <div className="card-group">
                        <div className="card-item">
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
                            </div>
                        </div>
                        <div className="card-item">
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
                        <div className="card-item">
                            <ChipInput
                                label='Tags (Optional)'
                                name='tags'
                                placeholder='Add tags...'
                                initialValues={tags}
                                onValuesChange={setTags}
                                maxChips={10}
                            />
                        </div>
                    </div>

                    {error && <Alert type='danger' message={error} className='mb-4' />}
                    <div className='flex w-full justify-end'>
                        <Button className='text-sm mr-4' label='Cancel' type='button' variant='tertiary' onClick={() => navigate(-1)} />
                        <Button className='text-sm ' isPending={false} label='Shorten Link' type='submit' variant='primary' />
                    </div>
                </div>
            </form>
        </section>
    )
}

export default LinkCreate