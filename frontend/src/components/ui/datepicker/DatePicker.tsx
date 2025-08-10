import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import './datePicker.css';
import IconClock from '../icons/IconClock';

interface DatePickerProps {
    showCalendar: boolean;
    setShowCalendar: (show: boolean) => void;
    setExpiryDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    expiryDate: Date | undefined;
}

export const DatePicker: React.FC<DatePickerProps> = ({ showCalendar, setShowCalendar, setExpiryDate, expiryDate }) => {
    const datePickerRef = useRef<HTMLDivElement>(null);
    const [selectedTime, setSelectedTime] = useState<string>('12:00');

    // Initialize time from expiryDate if it exists
    useEffect(() => {
        if (expiryDate) {
            const hours = expiryDate.getHours().toString().padStart(2, '0');
            const minutes = expiryDate.getMinutes().toString().padStart(2, '0');
            setSelectedTime(`${hours}:${minutes}`);
        }
    }, [expiryDate]);

    // Function to combine date and time into a unified UTC date
    const combineDateAndTime = (date: Date, timeString: string): Date => {
        const [hours, minutes] = timeString.split(':').map(Number);
        
        // Create a new date object with the selected date
        const combinedDate = new Date(date);
        
        // Set the time components
        combinedDate.setHours(hours, minutes, 0, 0);
        
        return combinedDate;
    };

    // Function to update the expiry date with unified date:time
    const updateExpiryDate = (date: Date, timeString: string) => {
        const combinedDate = combineDateAndTime(date, timeString);
        setExpiryDate(combinedDate);
    };

    useEffect(() => {
        if (showCalendar) {
            const handleClickOutside = (event: MouseEvent) => {
                if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                    setShowCalendar(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);

            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [showCalendar, setShowCalendar]);

    return (
        <div ref={datePickerRef} className='absolute bottom-0 left-0 w-fit h-fit z-5 bg-white shadow-lg p-5 rounded-xl'>
            <DayPicker
                mode="single"
                animate={true}
                selected={expiryDate}
                onSelect={(date) => {
                    if (date) {
                        updateExpiryDate(date, selectedTime);
                    }
                }}
                // onDayClick={() => setShowCalendar(false)}
            />
            <div className='mt-6 border-t border-gray-200 pt-4 flex items-center gap-1'>
                <label htmlFor="expiry-time" className='text-sm font-medium text-gray-700'>Expiry time: </label>
                <div className='flex items-center gap-2 border border-gray-200 rounded-md p-1 relative'>
                    <input
                        className='text-sm font-medium text-gray-700 border-0 outline-none pr-6'
                        type="time"
                        name="time"
                        id="expiry-time"
                        value={selectedTime}
                        onChange={(e) => {
                            const timeValue = e.target.value;
                            setSelectedTime(timeValue);
                            
                            // Update expiry date if we have a selected date
                            if (expiryDate) {
                                updateExpiryDate(expiryDate, timeValue);
                            }
                        }}
                    />
                    <IconClock className='text-gray-700 absolute right-2 pointer-events-none' size={18} />
                </div>
            </div>
        </div>
    );
}

export default DatePicker;