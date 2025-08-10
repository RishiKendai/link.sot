import React, { useState, useEffect, useCallback } from 'react'
import TextBox from '../../components/ui/inputs/TextBox'
import Button from '../../components/ui/button/Button'
import DatePicker from '../../components/ui/datepicker/DatePicker'
import IconCalendar from '../../components/ui/icons/IconCalendar'
import Checkbox from '../../components/ui/inputs/Checkbox'
import ChipInput from '../../components/ui/inputs/ChipInput'
import Toggle from '../../components/ui/Toggle'
import { useParams, useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useApiMutation } from '../../hooks/useApiMutation'
import { useQueryClient } from '@tanstack/react-query'
import Alert from '../../components/ui/Alert'

const baseURL = import.meta.env.VITE_FRONTEND_URL

/*
created_at
expiry_date
is_custom_backoff
is_flagged
original_url
password
scan_link
short_link
tags
uid
updated_at
user_uid
*/

type LinkState = {
    created_at: string;
    updated_at: string;
    original_url: string;
    short_link: string;
    expiry_date?: Date | undefined;
    scan_link: boolean;
    custom_backoff: string;
    password: string;
    tags: string[];
    uid: string;
    user_uid: string;
    is_custom_backoff: boolean;
}

const initialLinkState: LinkState = {
    created_at: '',
    updated_at: '',
    original_url: '',
    short_link: '',
    expiry_date: undefined,
    scan_link: false,
    custom_backoff: '',
    password: '',
    tags: [],
    uid: '',
    user_uid: '',
    is_custom_backoff: false,
}

const LinkEdit = () => {
    const { id: urlId } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [link, setLink] = useState<LinkState>(initialLinkState)
    const [showCalendar, setShowCalendar] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
    const [isCustomBackoffEnabled, setIsCustomBackoffEnabled] = useState(false)
    const [isPasswordEnabled, setIsPasswordEnabled] = useState(false)

    // Fetch link data
    const { data: linkData, isLoading: isFetching } = useApiQuery<LinkState>({
        path: `/links/${urlId}`,
        key: ['link', urlId],
    })

    // Populate fields when data is loaded
    useEffect(() => {
        if (linkData?.status === 'success' && linkData.data) {
            const { original_url, short_link, expiry_date, scan_link, password, tags, created_at, updated_at, uid, user_uid, is_custom_backoff } = linkData.data
            setLink({
                original_url: original_url || '',
                short_link: short_link || '',
                expiry_date: expiry_date ? new Date(expiry_date) : undefined,
                scan_link: !!scan_link,
                custom_backoff: short_link || '',
                password: password || '',
                tags: Array.isArray(tags) ? tags : [],
                created_at: created_at || '',
                updated_at: updated_at || '',
                uid: uid || '',
                user_uid: user_uid || '',
                is_custom_backoff: !!is_custom_backoff,
            })

            // Set toggle states based on data
            setIsCustomBackoffEnabled(!!is_custom_backoff)
            setIsPasswordEnabled(!!password)
        }
    }, [linkData])

    // Update mutation
    const { mutate: updateLink, isPending: isUpdating } = useApiMutation(['update-link'])

    // Helper function to format date for display
    const formatExpiryDateForDisplay = (expiryDate?: Date): string => {
        if (!expiryDate) return ''
        const date = expiryDate
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${day}-${month}-${year} - ${hours}:${minutes}`
    }

    // Generic input handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        let newValue: string | boolean = value
        if (type === 'checkbox') newValue = checked
        setLink(prev => ({ ...prev, [name]: newValue }))
    }

    // Custom handler for expiry date
    const handleExpiryDateChange = (expiry: Date | undefined) => {
        if (!expiry) {
            setLink(prev => ({
                ...prev, expiry_date: undefined
            }))
        } else {
            setLink(prev => ({ ...prev, expiry_date: expiry }))
        }
    }

    // Custom handler for tags
    const handleTagsChange = useCallback((tags: string[]) => {
        setLink(prev => ({ ...prev, tags }))
    }, [])

    // Validate all fields before submit
    const validateAll = () => {
        let valid = true
        const newFieldErrors: { [key: string]: string } = {}

        Object.entries(link).forEach(([name, value]) => {
            let error = ''
            switch (name) {
                case 'original_url':
                    error = typeof value !== 'string' || !value || !/^https?:\/\//.test(value) ? 'Enter a valid URL.' : ''
                    break
                case 'custom_backoff':
                    error = typeof value === 'string' && value && !/^[a-zA-Z0-9-_]*$/.test(value) ? 'Only alphanumeric, dash, and underscore allowed.' : ''
                    break
                case 'expiry_date':
                    if (value && value < new Date()) error = 'Expiry must be in the future.'
                    break
                case 'tags':
                    if (Array.isArray(value) && value.some((t) => typeof t !== 'string' || !t.trim())) error = 'Tags must be non-empty strings.'
                    break
                default:
                    break
            }
            if (error) {
                newFieldErrors[name] = error
                valid = false
            }
        })

        setFieldErrors(newFieldErrors)
        return valid
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        if (!validateAll()) {
            setError('Please fill in all required fields.')
            return
        }
        updateLink({
            path: `/links/${urlId}`,
            method: 'PUT',
            payload: {
                original_url: link.original_url,
                custom_backoff: isCustomBackoffEnabled ? link.custom_backoff : '',
                expiry_date: link.expiry_date ? link.expiry_date.toISOString() : undefined,
                password: isPasswordEnabled ? link.password : null,
                scan_link: link.scan_link,
                tags: link.tags,
            },
        }, {
            onSuccess: (res: unknown) => {
                if (typeof res === 'object' && res !== null && 'status' in res && res.status === 'success' && 'data' in res && res.data && typeof res.data === 'object' && 'short_link' in res.data) {
                    // Invalidate and refetch links
                    queryClient.invalidateQueries({ queryKey: ['links'] })
                    navigate(`/links/${link.short_link}/details`, { state: { status: 'UPDATED', replace: true } })
                } else if (typeof res === 'object' && res !== null && 'message' in res && typeof (res as { message?: unknown }).message === 'string') {
                    setError((res as { message?: string }).message || 'Failed to update link.')
                } else {
                    setError('Failed to update link.')
                }
            },
            onError: (err: unknown) => {
                if (typeof err === 'object' && err !== null && 'error' in err && typeof (err as { error?: unknown }).error === 'string') {
                    setError((err as { error?: string }).error || 'Something went wrong. Please try again.')
                } else {
                    setError('Something went wrong. Please try again.')
                }
            },
        })
    }

    // For DatePicker, use a wrapper to adapt the signature
    const setExpiryDate = handleExpiryDateChange as React.Dispatch<React.SetStateAction<Date | undefined>>

    return (
        <section className='min-h-screen flex flex-col py-8 w-full'>
            <form onSubmit={handleSubmit}>
                <div className='flex flex-col w-full space-y-7 px-2 md:px-8 max-w-5xl justify-self-center'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-6'>Edit Short Link</h2>
                    <div className="group-fields card-group w-full">
                        <div className='card-item'>
                            <TextBox
                                label='Original URL'
                                name='original_url'
                                type='url'
                                placeholder='https://www.example.com'
                                id='url'
                                value={link.original_url}
                                onChange={handleInputChange}
                                disabled={isFetching || isUpdating}
                                error={fieldErrors.original_url}
                            />
                        </div>
                        {/* Custom back-half */}
                        <div className="card-item">
                            <div className='flex flex-col gap-3'>
                                <Toggle
                                    className='w-full'
                                    label="Custom Back-Half"
                                    enabled={isCustomBackoffEnabled}
                                    onToggle={setIsCustomBackoffEnabled}
                                    disabled={isFetching || isUpdating}
                                />
                                <div className='flex items-end gap-2 w-full pb-5'>
                                    <TextBox
                                        // label='Custom Back-Half'
                                        name='custom_backoff'
                                        type='text'
                                        placeholder='custom-back-half'
                                        id='custom-back-half-base'
                                        value={baseURL}
                                        className='text-gray-400'
                                        disabled
                                    />
                                    <span className='text-black leading-6 py-2'>/</span>
                                    <TextBox
                                        name='custom_backoff'
                                        type='text'
                                        placeholder='custom-back-half'
                                        id='custom-back-half'
                                        value={link.custom_backoff}
                                        wrapperClass='w-full'
                                        onChange={handleInputChange}
                                        disabled={isFetching || isUpdating || !isCustomBackoffEnabled}
                                        readOnly={!isCustomBackoffEnabled}
                                        error={fieldErrors.custom_backoff}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <h5 className='text-lg font-semibold text-gray-900 mb-4'>Advanced Settings</h5>
                    <div className="card-group">
                        <div className="card-item">
                            {/* Expiry date, password, and protection */}
                            {/* <div className='grid grid-cols-2 gap-8'> */}
                            <div className='flex flex-col gap-8 relative'>
                                <TextBox
                                    onClick={() => setShowCalendar(true)}
                                    label='Expiry Date (Optional)'
                                    name='expiry_date'
                                    type='text'
                                    placeholder='DD-MM-YYYY - HH:MM'
                                    id='expiry-date'
                                    value={formatExpiryDateForDisplay(link.expiry_date)}
                                    readOnly={true}
                                    postfixIcon={<IconCalendar className='text-gray-600' />}
                                    disabled={isFetching || isUpdating}
                                    error={fieldErrors.expiry_date}
                                />
                                {showCalendar && (
                                    <DatePicker
                                        showCalendar={showCalendar}
                                        setShowCalendar={setShowCalendar}
                                        setExpiryDate={setExpiryDate}
                                        expiryDate={link.expiry_date}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="card-item">
                            <div className='flex flex-col gap-3'>
                                <Toggle
                                    label="Password (Optional)"
                                    enabled={isPasswordEnabled}
                                    onToggle={setIsPasswordEnabled}
                                    disabled={isFetching || isUpdating}
                                />
                                <TextBox
                                    name='password'
                                    type='text'
                                    id='password'
                                    value={link.password}
                                    onChange={handleInputChange}
                                    placeholder='Enter password'
                                    disabled={isFetching || isUpdating || !isPasswordEnabled}
                                    readOnly={!isPasswordEnabled}
                                />
                            </div>
                        </div>
                        {/* </div> */}
                        <div className="card-item">
                            {/* Tags */}
                            <ChipInput
                                label='Tags (Optional)'
                                name='tags'
                                placeholder='Add tags...'
                                initialValues={link.tags}
                                onValuesChange={handleTagsChange}
                                disabled={isFetching || isUpdating}
                                error={fieldErrors.tags}
                                maxChips={10}
                            />
                        </div>
                        <div className="card-item">
                            <Checkbox
                                label='Enable Protection (Auto scan for malicious email)'
                                id='scan-link'
                                checked={link.scan_link}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    {error && <Alert type='danger' message={error} className='mb-4' />}
                    <div className='flex justify-end'>
                        <Button className='mr-6 text-base' label='Cancel' type='button' variant='secondary' disabled={isFetching || isUpdating} onClick={() => navigate('/links')} />
                        <Button className='text-base' isPending={isUpdating} label='Update Link' type='submit' variant='primary' disabled={isFetching || isUpdating} />
                    </div>
                </div>
            </form>
        </section>
    )
}

export default LinkEdit