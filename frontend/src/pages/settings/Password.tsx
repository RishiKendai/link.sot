import React, { useState } from 'react';
import TextBox from '../../components/ui/inputs/TextBox';
import Button from '../../components/ui/button/Button';
import { useApiMutation } from '../../hooks/useApiMutation';
import { toast } from 'sonner';
import IconEye from '../../components/ui/icons/IconEye';
import IconEyeOff from '../../components/ui/icons/IconEyeOff';

type PasswordState = {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
};

type PasswordPayload = {
    oldPassword: string;
    newPassword: string;
};

type PasswordVisibilityState = {
    oldPassword: boolean;
    newPassword: boolean;
    confirmPassword: boolean;
};

const Password: React.FC = () => {
    const [formError, setFormError] = useState<Record<string, string>>({});
    const [password, setPassword] = useState<PasswordState>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibilityState>({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const { mutate: updatePassword, isPending } = useApiMutation<PasswordPayload>(['update-password']);

    const toggleVisibility = (field: keyof PasswordVisibilityState) => {
        setPasswordVisibility(prev => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const PostfixIcon = (field: keyof PasswordVisibilityState) => (
        <span className="cursor-pointer self-center opacity-85 hover:opacity-100" onClick={() => toggleVisibility(field)}>
            {passwordVisibility[field] ? <IconEye size={20} /> : <IconEyeOff size={20} />}
        </span>
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!password.oldPassword) return setFormError({ oldPassword: 'Current password is required' });
        if (!password.newPassword) return setFormError({ newPassword: 'New password is required' });
        if (!password.confirmPassword) return setFormError({ confirmPassword: 'Confirm password is required' });
        if (password.newPassword !== password.confirmPassword) return setFormError({ confirmPassword: 'Passwords do not match' });

        setFormError({});

        updatePassword(
            {
                path: '/settings/password',
                method: 'PUT',
                payload: { oldPassword: password.oldPassword, newPassword: password.newPassword },
            },
            {
                onSuccess: data => {
                    if (data.status === 'success') {
                        toast.success('Password updated successfully');
                        setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
                        setFormError({});
                    } else if (data.status === 'error') {
                        if (data.error === 'password_mismatch') {
                            toast.error('Current password is not correct');
                            return;
                        }
                        toast.error('Failed to update password', {duration: 2000});
                        console.error('Error updating password::', data.error);
                    }
                },
                onError: error => {
                    console.error('Error updating password::', error);
                    toast.error('Failed to update password');
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="px-6 flex flex-col h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Change Password</h1>
            <div className="space-y-6">
                <TextBox
                    id='oldPassword'
                    label="Current Password"
                    name="oldPassword"
                    value={password.oldPassword}
                    onChange={handleInputChange}
                    error={formError.oldPassword}
                    type={passwordVisibility.oldPassword ? 'text' : 'password'}
                    postfixIcon={PostfixIcon('oldPassword')}
                />
                <TextBox
                    id='newPassword'
                    label="New Password"
                    name="newPassword"
                    value={password.newPassword}
                    onChange={handleInputChange}
                    error={formError.newPassword}
                    type={passwordVisibility.newPassword ? 'text' : 'password'}
                    postfixIcon={PostfixIcon('newPassword')}
                />
                <TextBox
                    id='confirmPassword'
                    label="Confirm Password"
                    name="confirmPassword"
                    value={password.confirmPassword}
                    onChange={handleInputChange}
                    error={formError.confirmPassword}
                    type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                    wrapperClass="mb-6"
                    postfixIcon={PostfixIcon('confirmPassword')}
                />
            </div>
            <Button
                type="submit"
                variant="primary"
                label="Save Changes"
                className="mt-auto ml-auto"
                isPending={isPending}
            />
        </form>
    );
};

export default Password;
