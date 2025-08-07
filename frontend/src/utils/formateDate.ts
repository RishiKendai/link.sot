export function formatToHumanDate(date: string): string {
    const dateObj = new Date(date)  
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const day = dateObj.getDate()
    const month = months[dateObj.getMonth()]
    const year = dateObj.getFullYear()
    return `${month} ${day},  ${year}`
}

export function epochToHumanDate(date: number): string{
    const dateObj = new Date(date * 1000) // Convert seconds to milliseconds
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const day = dateObj.getDate()
    const month = months[dateObj.getMonth()]
    const year = dateObj.getFullYear()
    return `${month} ${day},  ${year}`
}