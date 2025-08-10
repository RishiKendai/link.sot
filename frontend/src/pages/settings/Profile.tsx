import type React from 'react';
import TextBox from '../../components/ui/inputs/TextBox';
import { useAuth } from '../../context/UseAuth';
import Button from '../../components/ui/button/Button';
import { useEffect, useState } from 'react';
import { compareState } from '../../utils/compareState';
import { toast } from 'sonner';
import { useApiMutation } from '../../hooks/useApiMutation';


type ProfileState = {
    name: string;
}

let initialProfile: ProfileState = {
    name: ''
};


const Profile: React.FC = () => {
    const { user, setUser } = useAuth();


    const [profile, setProfile] = useState<ProfileState>(initialProfile);
    const [formError, setFormError] = useState<Record<string, string>>({});

    const { mutate: updateProfile, isPending } = useApiMutation<ProfileState, ProfileState>(['update-profile']);

    useEffect(() => {
        if (user) {
            initialProfile = {
                name: user.name
            }
            setProfile({
                name: user.name
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (profile.name === '') {
            setFormError({
                name: 'Name is required',
            })
            return;
        }
        if (profile.name.length < 3) {
            setFormError({
                name: 'Name must be at least 3 characters long',
            })
            return;
        }

        setFormError({});

        const payload = compareState(initialProfile, profile)
        if (!payload) {
            toast.info('Profile is already up to date')
            return;
        }

        updateProfile({
            path: '/settings/profile',
            method: 'PUT',
            payload: payload
        }, {
            onSuccess: (data) => {
                if (data.status === 'success' && data.data) {
                    toast.success('Profile updated successfully')
                    setUser({
                        name: data.data.name,
                        email: user?.email ?? ''
                    })
                } else if (data.status === 'error') {
                    toast.error("Failed to update profile")
                    console.error('Failed to update profile:: ', data.error)
                }
            },
            onError: (err: unknown) => {
                console.error('err :::: ', err)
                toast.error('Failed to update profile')
            }
        })

    };

    return (
        <>
            <form onSubmit={handleSave} className='px-6 flex flex-col h-full'>
                <h1 className="text-2xl font-bold text-gray-800 mb-8">My Profile</h1>
                <div className='space-y-6'>
                    <TextBox label="Name" value={profile.name} id="name" onChange={handleInputChange} error={formError.name} />
                    <TextBox label='Email' value={user?.email ?? ''} id='email' disabled={true} />
                </div>
                <Button
                    type='submit'
                    variant='primary'
                    label='Save Changes'
                    className='mt-auto ml-auto'
                    // Remove onClick, let form handle submit via onSubmit
                    isPending={isPending}
                />
            </form>
        </>
    );
}

export default Profile;