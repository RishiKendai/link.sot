import React, { useEffect, useState } from 'react'
import type { APIKeysType, ApiKeyType } from './types';
import { useApiQuery } from '../../hooks/useApiQuery';
import IconDelete from '../../components/ui/icons/IconDelete';
import { epochToHumanDate } from '../../utils/formateDate';
import { useApiMutation } from '../../hooks/useApiMutation';
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/button/Button';




const APIManagement: React.FC = () => {
    const queryClient = useQueryClient();

    const [apiKeys, setApiKeys] = useState<ApiKeyType[] | null>(null);
    const [keyToDelete, setKeyToDelete] = useState('');

    const { mutate: deleteAPIKeyMutation, isPending: isDeleting } = useApiMutation(['delete-api-keys']);
    const { data, isPending, isError } = useApiQuery<APIKeysType>({
        path: '/settings/api',
        key: ['api-keys']
    });

    useEffect(() => {
        if (data?.status === 'success' && data.data) {
            setApiKeys(data.data.api_keys)
        }
    }, [data])

    if (isError) {
        return <ErrorState />
    }

    const deleteAPIKeyHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        deleteAPIKeyMutation({
            path: `/settings/api/${keyToDelete}`,
            method: 'DELETE'
        }, {
            onSuccess: (data) => {
                if (data.status === 'success') {
                    const updatedKeys = apiKeys?.filter((key) => key.id !== keyToDelete) as ApiKeyType[];
                    setApiKeys(updatedKeys)
                    setKeyToDelete('')
                    queryClient.setQueryData(['api-keys'], updatedKeys)
                    toast.success("API Key deleted successfully")
                } else if (data.status === 'error') {
                    toast.error("Failed to delete API Key")
                    console.error('Failed to delete API Key:: ', data.error)
                }
            },
            onError: (err: unknown) => {
                console.error('err :::: ', err)
                toast.error('Failed to delete API Key')
                setKeyToDelete('')
            }
        })
    }

    return (
        <>
            <div>
                {/* Header */}
                <div className='mb-4'>
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">API Keys</h2>
                    <p className="text-gray-600 mb-2">Manage your API keys and settings here.</p>
                </div>
                <div className="custom-scroll pb-1 overflow-x-auto">
                    <table className="min-w-full text-left text-sm md:text-base api-keys-table">
                        <thead className="text-xs md:text-sm text-gray-700 uppercase bg-gray-100 border-b border-b-gray-300">
                            <tr>
                                <th scope="col" className="w-40 max-w-40 overflow-hidden whitespace-nowrap py-4 px-6">Label</th>
                                <th scope="col" className="w-40 max-w-40 overflow-hidden whitespace-nowrap py-4 px-6">API Key</th>
                                <th scope="col" className="w-40 max-w-40 overflow-hidden whitespace-nowrap py-4 px-6">Created</th>
                                <th scope="col" className="w-40 max-w-40 overflow-hidden whitespace-nowrap py-4 px-6">Status</th>
                                <th scope="col" className="w-40 max-w-40 overflow-hidden whitespace-nowrap py-4 px-6 sticky right-0 z-10 bg-gray-100">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isPending || !apiKeys ? (
                                <Shimmer count={2} />
                            ) : apiKeys.length > 0 ? (
                                <>
                                    {apiKeys.map((item, index) => (
                                        <TableData key={index} data={item} handleAction={setKeyToDelete} />
                                    ))}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
            <Modal isOpen={keyToDelete !== ''} onClose={() => setKeyToDelete('')} title='Confirm Delete'>
                <form onSubmit={deleteAPIKeyHandler}>
                    <div className='flex flex-col items-center justify-center'></div>
                    <h5 className='text-base'>Are you sure you want to delete this API Key?</h5>
                    <p className='text-gray-500 text-sm'>This action cannot be undone.</p>
                    <div className='flex items-center justify-end mt-4'>
                        <Button className='w-fit mr-4' type='button' variant='tertiary' onClick={() => setKeyToDelete('')} label='Cancel' />
                        <Button autoFocus={true} className='w-fit' type='submit' variant='danger-primary' label='Delete' isPending={isDeleting} />
                    </div>
                </form>
            </Modal>
        </>
    )
}

export default APIManagement


const EmptyState: React.FC = () => {
    return (
        <div className='flex flex-col items-center justify-center h-96 bg-gray-100'>
            <h5 className='text-lg'>No API Keys found</h5>
            <p className='text-gray-500'>Create a new API key to get started.</p>
        </div>
    )
}

const ErrorState: React.FC = () => {
    return (
        <div className='flex flex-col items-center justify-center h-96'>
            <h5 className='text-lg text-red-500'>Something went wrong</h5>
            <p className='text-gray-500'>Please try again later.</p>
        </div>
    )

}

const Shimmer: React.FC<{ count: number }> = ({ count }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index: number) => (
                <tr key={`shimmer-apikeys-${index}`} className="border-b border-gray-200">
                    <td className="w-40 max-w-40 overflow-hidden whitespace-nowrap py-3 px-6">
                        <div className="w-24 h-4 shimmer rounded"></div>
                    </td>
                    <td className="w-40 max-w-40 overflow-hidden whitespace-nowrap py-4 px-6">
                        <div className="w-full h-4 shimmer rounded"></div>
                    </td>
                    <td className="w-40 max-w-40 overflow-hidden whitespace-nowrap py-4 px-6">
                        <div className="w-full h-4 shimmer rounded"></div>
                    </td>
                    <td className="w-40 max-w-40 overflow-hidden whitespace-nowrap py-4 px-6">
                        <div className="w-full h-4 shimmer rounded"></div>
                    </td>
                    <td className="w-40 max-w-40 overflow-hidden whitespace-nowrap py-4 px-6">
                        <div className="w-full h-4 shimmer rounded"></div>
                    </td>
                </tr>
            ))}
        </>
    );
};

const TableData: React.FC<{ data: ApiKeyType, handleAction: React.Dispatch<React.SetStateAction<string>> }> = ({ data, handleAction }) => {

    return (
        <tr className="border-b border-gray-200">
            <td className="w-40 max-w-40 truncate overflow-hidden whitespace-nowrap py-4 px-6">{data.label}</td>
            <td className="w-40 max-w-40 truncate overflow-hidden whitespace-nowrap py-4 px-6">{data.masked_key}</td>
            <td className="w-40 max-w-40 truncate overflow-hidden whitespace-nowrap py-4 px-6">{epochToHumanDate(data.created_at)}</td>
            <td className="w-40 max-w-40 truncate overflow-hidden whitespace-nowrap py-4 px-6">
                <span className='bg-green-100 text-green-800 px-4 py-2 rounded-full capitalize'>{data.status}</span>
            </td>
            <td className="w-40 max-w-40 whitespace-nowrap py-4 px-6 sticky right-0 z-10 action bg-[var(--clr-primary)]">
                <button className='cursor-pointer' onClick={() => handleAction(data.id)}><IconDelete color='red' size={18} /></button>
            </td>
        </tr>
    )
}