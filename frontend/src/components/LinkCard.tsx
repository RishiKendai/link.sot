import { useNavigate } from 'react-router-dom';
import { formatToHumanDate } from '../utils/formateDate';
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
import './linkcard.css'
import IconQrCode from './ui/icons/IconQrCode';
import ModalShare from './ModalShare';

type LinkType = {
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

type LinkProps = {
    link: LinkType;
    setLinkId?: React.Dispatch<React.SetStateAction<string>>;
}


const baseURL = import.meta.env.VITE_SOT_HOST

const LinkCard: React.FC<LinkProps> = ({ link, setLinkId }) => {
    const { hide = [] } = link
    const navigate = useNavigate()
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)

    const host = new URL(link.original_url).host
    return (
        <>

            <div key={link.uid} className='relative flex flex-col md:flex-row bg-white rounded-2xl border-silver p-6'>
                {/* card left */}
                <div className='flex flex-1 link__card-left min-w-0'>
                    {/* favicon */}
                    <div className="w-8 h-8 flex-shrink-0">
                        <img src={`https://www.google.com/s2/favicons?sz=64&domain=${host}`} alt="Favicon" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col px-4 min-w-0">
                        <div className="flex flex-col mb-8">
                            <p className="w-fit text-gray-400 text-sm font-medium mb-1">{formatToHumanDate(link.created_at.toString())}</p>
                            <p className="w-fit max-w-full text-[var(--text-primary)] text-lg font-bold truncate">{baseURL}/{link.short_link}</p>
                            <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="w-fit text-sm max-w-full truncate text-blue-500 hover:underline hover:text-blue-600 underline-offset-3">{link.original_url}</a>
                        </div>

                        {/* analytics menu */}
                        <div className="flex gap-4 w-full">
                            <div className='flex flex-wrap items-center gap-4 flex-1 min-w-0'>
                                {/* Analytics */}
                                <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate(`/links/analytics/${link.uid}`)}>
                                    <IconAnalytics size={16} color='blue' />
                                    <p className='text-blue-700 text-sm font-semibold'>View Analytics</p>
                                </div>
                                {/* expiry date */}
                                <Tooltip text='Expires on' dir='top'>
                                    <div className='flex items-center gap-1 cursor-default'>
                                        <IconExpiry size={18} className='text-gray-400' />
                                        <p className='text-gray-400 text-sm font-medium'>{formatToHumanDate(link.expiry_date.toString())}</p>
                                    </div>
                                </Tooltip>
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
                        </div>
                    </div>
                </div>
                {/* card right */}
                <div className="flex flex-shrink-0 flex-row md:flex-col gap-4 flex-wrap justify-between">
                    {/* Menu items */}
                    <div className="flex items-start gap-2 justify-end">
                        {/* Copy */}
                        {hide && !hide.includes('copy') &&
                            <Tooltip text='Copy' dir='bottom'>
                                <div
                                    className='flex cursor-pointer items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 border border-gray-200'
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
                                </div>
                            </Tooltip>
                        }
                        {/* Edit */}
                        {hide && !hide.includes('edit') &&
                            <Tooltip text='Edit' dir='bottom'>
                                <div onClick={() => navigate(`/links/edit/${link.short_link}`)} className='flex cursor-pointer items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 border border-gray-200'>
                                    <IconEdit size={18} />
                                </div>
                            </Tooltip>
                        }
                        {/* Delete */}
                        {hide && !hide.includes('delete') && setLinkId &&
                            <Tooltip text='Delete' dir='bottom'>
                                <div onClick={() => setLinkId(link.uid)} className='flex cursor-pointer items-center justify-center w-8 h-8 rounded-md hover:bg-red-100 border border-red-200'>
                                    <IconDelete size={18} color='red' />
                                </div>
                            </Tooltip>
                        }
                    </div>
                    {/* QR code */}
                    <div className='ml-auto relative'>
                        {/* qr code */}
                        <Tooltip text='View QR Code' dir='top'>
                            <div className="cursor-pointer" onClick={() => {
                                setIsShareModalOpen(true)
                            }}>
                                <IconQrCode />
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>
            {isShareModalOpen && <ModalShare url={link.short_link} handleModalState={setIsShareModalOpen} />}
        </>
    )
}

export default LinkCard