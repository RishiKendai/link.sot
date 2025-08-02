import { useNavigate } from 'react-router-dom';
import { formatToHumanDate } from '../utils/formateDate';
import QRCodeGenerator from './QRCodeGenerator';
import IconAnalytics from './ui/icons/IconAnalytics';
import IconCopy from './ui/icons/IconCopy';
import IconDelete from './ui/icons/IconDelete';
import IconEdit from './ui/icons/IconEdit';
import IconExpiry from './ui/icons/IconExpiry';
import IconShield from './ui/icons/IconShield';
import IconShieldOff from './ui/icons/IconShieldOff';
import IconTag from './ui/icons/IconTag';
import IconTick from './ui/icons/IconTick';
import Tooltip from './ui/Tooltip';
import { useState } from 'react';

type LinkProps = {
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
    hide?: string[];
}

const baseURL = import.meta.env.VITE_SOT_HOST

const LinkCard: React.FC<{ link: LinkProps }> = ({ link }) => {
    const { hide = [] } = link
    const navigate = useNavigate()
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
    console.log('host ', new URL(link.original_url).host)
    const host = new URL(link.original_url).host
    return (
        // links.map((link) => {
        <div key={link.uid} className='relative flex bg-white rounded-2xl border-silver w-full p-6'>
            <div>
                {/* favIcon */}
                <div className="flex items-center gap-2 w-8 h-8 mr-4">
                    <img src={`https://www.google.com/s2/favicons?sz=64&domain=${host}`} alt="Favicon" className="w-full h-full object-cover" />
                </div>
            </div>
            <div className='w-full'>
                <div className="flex mb-8 w-full">
                    {/* date, title/original_url, short_link */}
                    <div className="flex flex-col w-full mr-4">
                        <p className="w-fit text-gray-400 text-sm font-medium mb-1">{formatToHumanDate(link.created_at.toString())}</p>
                        <p className="w-fit text-[var(--text-primary)] text-lg font-bold truncate">{baseURL}/{link.short_link}</p>
                        <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="w-fit text-sm truncate text-blue-500 hover:underline hover:text-blue-600 underline-offset-3">{link.original_url}</a>
                    </div>

                    {/* menu items */}
                    <div className="flex items-start gap-2 ml-auto">
                        {/* Copy */}
                        {hide && !hide.includes('copy') &&
                            <div
                                className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 border border-gray-200 relative group'
                                onClick={() => {
                                    navigator.clipboard.writeText(baseURL + '/' + link.short_link)
                                    setCopiedLinkId(link.uid)
                                    setTimeout(() => {
                                        setCopiedLinkId(null)
                                    }, 2000)
                                }}
                            >
                                {copiedLinkId === link.uid ? (
                                    <IconTick size={18} />
                                ) : (
                                    <IconCopy size={18} />
                                )}
                                {/* tooltip */}
                                <Tooltip text='Copy' dir='bottom' />
                            </div>
                        }
                        {/* Edit */}
                        {hide && !hide.includes('edit') &&
                            <div onClick={() => navigate(`/links/edit/${link.short_link}`)} className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 border border-gray-200 relative group'>
                                <IconEdit size={18} />
                                <Tooltip text='Edit' dir='bottom' />
                            </div>
                        }
                        {/* Delete */}
                        {hide && !hide.includes('delete') &&
                            <div className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-red-100 border border-red-200 relative group'>
                                <IconDelete size={18} color='red' />
                                <Tooltip text='Delete' dir='bottom' />
                            </div>
                        }
                    </div>
                </div>
                <div className='flex justify-between items-center'>
                    <div className='flex flex-wrap items-center gap-4'>
                        {/* Analytics */}
                        <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate(`/links/analytics/${link.uid}`)}>
                            <IconAnalytics size={16} color='blue' />
                            <p className='text-blue-700 text-sm font-semibold'>View Analytics</p>
                        </div>
                        {/* expiry date */}
                        <div className='flex items-center gap-1 relative group cursor-default'>
                            <IconExpiry size={18} className='text-gray-400' />
                            <p className='text-gray-400 text-sm font-medium'>{formatToHumanDate(link.expiry_date.toString())}</p>
                            {/* tooltip */}
                            <Tooltip text='Expires on' dir='bottom' />
                        </div>
                        {/* is password protected */}
                        <div className='flex items-center gap-1'>
                            {link.password ? (
                                <>
                                    <IconShield size={18} color='green' />
                                    <p className='text-green-600 text-sm font-medium'>Password Protected</p>
                                </>
                            ) : (
                                <>
                                    <IconShieldOff size={18} color='gray' />
                                    <p className='text-gray-500 text-sm font-medium'>Public</p>
                                </>
                            )}
                        </div>
                        {/* tags */}
                        {
                            link.tags && link.tags.length > 0 && (
                                <div className='flex items-center'>
                                    <IconTag size={18} className='mr-1 text-gray-400' />
                                    <div className='flex items-center gap-1 flex-wrap'>
                                        {link.tags.slice(0, 3).map((tag: string, index: number) => (
                                            <span key={index} className='text-gray-400 text-xs font-medium bg-gray-100 px-2 py-1 rounded-md'>
                                                #{tag}
                                            </span>
                                        ))}
                                        {link.tags.length > 3 && (
                                            <span className='text-gray-400 text-xs font-medium'>
                                                +{link.tags.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <div>
                        {/* qr code */}
                        <QRCodeGenerator
                            url={`${baseURL}/${link.short_link}?r=qr`}
                            size={48}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            isQR={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LinkCard