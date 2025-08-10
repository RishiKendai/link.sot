import type React from 'react';
import TextBox from '../../components/ui/inputs/TextBox';
import Button from '../../components/ui/button/Button';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useApiMutation } from '../../hooks/useApiMutation';
import Loader from '../../components/ui/Loader';
import Toggle from '../../components/ui/Toggle';
import { useApiQuery } from '../../hooks/useApiQuery';
import clsx from 'clsx';
import { useQueryClient } from '@tanstack/react-query';

type DomainType = {
    domain: string;
    subdomain: string | null;
    use_subdomain: boolean;
}

const Domain: React.FC = () => {
    const queryClient = useQueryClient()

    const [domain, setDomain] = useState<DomainType | null>(null);
    const [isSubdomain, setIsSubDomain] = useState(false);

    const { data, isPending, isError } = useApiQuery<DomainType>({
        path: '/settings/domain',
        key: ['custom-domain'],
    })


    useEffect(() => {
        if (data?.status === 'success' && data.data) {
            setDomain(data.data)
            setIsSubDomain(data.data.use_subdomain)
        }
    }, [data])

    const { mutate: updateDomain, isPending: isUpdatePending } = useApiMutation<{ use_subdomain: boolean }, DomainType>(['update-domain']);


    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateDomain({
            path: '/settings/domain',
            method: 'PUT',
            payload: { "use_subdomain": isSubdomain }
        }, {
            onSuccess: (data) => {
                if (data.status === 'success') {
                    toast.success('Domain settings updated successfully')
                    queryClient.invalidateQueries({ queryKey: ['custom-domain'] })
                } else if (data.status === 'error') {
                    toast.error("Failed to update domain")
                    console.error('Failed to update domain:: ', data.error)
                }
            },
            onError: (err: unknown) => {
                console.error('err :::: ', err)
                toast.error('Failed to update domain')
            }
        })
    };

    if (isPending || !domain) {
        return (
            <div className='h-full flex items-center justify-center'>
                <Loader color='#6366f1' />
            </div>
        )
    }

    if (isError) {
        return (
            <div className='h-full flex items-center justify-center'>
                <p className='text-lg font-semibold text-gray-800'>
                    Something went wrong. Please try again.
                </p>
            </div>
        )
    }

    console.log('isSubdomain', isSubdomain)
    return (
        <>
            <form onSubmit={handleSave} className='px-6 flex flex-col h-full'>
                <h1 className="text-2xl font-bold text-gray-800 mb-8">Manage Domain</h1>
                <div className='space-y-6'>
                    <div className='flex flex-col'>
                        <TextBox
                            label='Custom Domain'
                            value={domain.subdomain || domain.domain}
                            id='domain-name'
                            disabled={true}
                            wrapperClass='mb-2'
                        />
                        <span className={clsx('text-sm text-gray-400', domain.subdomain && 'text-green-700')}>
                            {domain.subdomain
                                ? 'You already have a subdomain enabled. Contact your admin if you’d like to change it.'
                                : 'You don’t have a subdomain yet. Contact your admin to get one for branding and customizing your short links.'}
                        </span>
                    </div>

                    <div className='flex flex-col gap-3'>
                        <Toggle
                            className='w-full'
                            label="Enable Subdomain"
                            enabled={isSubdomain}
                            onToggle={() => setIsSubDomain((prev) => !prev)}
                            disabled={!domain.domain}
                        />
                        <span className='text-sm text-gray-600'>
                            {domain.domain
                                ? 'When enabled, all your short links will use your custom subdomain set by the admin. Disable to switch back to the default domain. To change your subdomain, please contact your admin.'
                                : 'You don’t have a custom subdomain yet. Contact your admin to get one for branding and customizing your short links. Once assigned, you can enable it here to use it for all short links.'}
                        </span>
                    </div>
                </div>
                <Button
                    type='submit'
                    variant='primary'
                    label='Save Changes'
                    className='mt-auto ml-auto'
                    isPending={isUpdatePending}
                />
            </form>
        </>
    );
}

export default Domain;