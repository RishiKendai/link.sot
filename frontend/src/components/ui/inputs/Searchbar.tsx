import React, { useState, useCallback, useRef } from 'react'

import './searchbar.css'
import IconSearch from '../icons/IconSearch'

interface SearchbarProps {
    placeholder: string;
    onSearch: (search: string) => void;
    className?: string;
}

const Searchbar: React.FC<SearchbarProps> = ({ placeholder, onSearch, className }) => {
    const [search, setSearch] = useState('')
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    
    const debouncedSearch = useCallback((searchTerm: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            onSearch(searchTerm)
        }, 500)
    }, [onSearch])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        debouncedSearch(value)
    }

  return (
    <div className={`relative flex items-center border border-gray-300 rounded-lg p-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${className}`}>
        <IconSearch className='absolute left-3 text-gray-400 pointer-events-none' size={20} />
        <input onChange={handleInputChange} value={search} type="text" placeholder={placeholder} className='searchbar-input border-0 outline-none pl-8' />
    </div>
  )
}

export default Searchbar