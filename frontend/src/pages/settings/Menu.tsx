import clsx from 'clsx';

type MenuProps = {
    setCurrent: ({ label, id }: { label: string, id: string }) => void;
    onItemClick?: () => void;
    currentSetting: {
        label: string;
        id: string;
    }
};

const Menu: React.FC<MenuProps> = ({ setCurrent, onItemClick, currentSetting }) => {
    const handleClick = (label: string, id: string) => {
        setCurrent({ label, id });
        onItemClick?.();
    };

    return (
        <ul className="space-y-6 py-4">
            <li>
                <h2 className="sidebar-heading">Account</h2>
                <ul className="space-y-2">
                    <li><button onClick={() => handleClick('My Profile', 'MY_PROFILE')} className={clsx('w-full text-left sidebar-items', currentSetting.id === 'MY_PROFILE' && 'active')}>My Profile</button></li>
                    <li><button onClick={() => handleClick('Google Account', 'GOOGLE_ACCOUNT')} className={clsx('w-full text-left sidebar-items', currentSetting.id === 'GOOGLE_ACCOUNT' && 'active')}>Google Account</button></li>
                </ul>
            </li>
            <li>
                <h2 className="sidebar-heading">Security</h2>
                <ul className="space-y-2">
                    <li><button onClick={() => handleClick('Change Password', 'CHANGE_PASSWORD')} className={clsx('w-full text-left sidebar-items', currentSetting.id === 'CHANGE_PASSWORD' && 'active')}>Change Password</button></li>
                </ul>
            </li>
            <li>
                <h2 className="sidebar-heading">Integrations</h2>
                <ul className="space-y-2">
                    <li><button onClick={() => handleClick('API', 'API')} className={clsx('w-full text-left sidebar-items', currentSetting.id === 'API' && 'active')}>API</button></li>
                </ul>
            </li>
        </ul>
    );
};

export default Menu;