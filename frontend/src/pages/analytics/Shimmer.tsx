// Analytics Shimmer Component
const Shimmer: React.FC = () => {
    return (
        <div className="w-full p-2 md:p-9">
            {/* Header Shimmer */}
            <div className="mb-8">
                <div className="w-64 h-10 shimmer rounded mb-2"></div>
                <div className="w-96 h-5 shimmer rounded"></div>
            </div>

            {/* Period Selector Shimmer */}
            <div className="mb-6">
                <div className="flex gap-2">
                    <div className="w-20 h-10 shimmer rounded-lg"></div>
                    <div className="w-24 h-10 shimmer rounded-lg"></div>
                    <div className="w-20 h-10 shimmer rounded-lg"></div>
                </div>
            </div>

            {/* Top Links Shimmer */}
            <div className="analytics-layout mb-8">
                <div className='shimmer h-[420px] border-silver rounded-2xl py-6'></div>
                <div className='shimmer h-[420px] border-silver rounded-2xl py-6'></div>
            </div>

            <div className="h-[420px] analytics-layout mb-8 flex flex-col">
                <div>
                    <div className="shimmer rounded-lg h-7 mb-4"></div>
                    <div className="shimmer rounded-2xl h-full"></div>
                </div>
                <div>
                    <div className="shimmer rounded-lg h-7 mb-4"></div>
                    <div className="shimmer rounded-2xl h-full"></div>
                </div>
            </div>
        </div>
    );
};
export default Shimmer;