export type TopPerformingLinkType = {
    short_link: string;
    full_short_link: string;
    original_link: string;
    total_clicks: number;
    qr_clicks: number;
    direct_clicks: number;
}

export type RecentActivityType = {
    short_link: string;
    full_short_link: string;
    original_link: string;
    location: string;
    device: string;
    click_source: string;
    click_time: string;
}

export type GeoGraphicDataType = {
    country: string;
    country_code: string;
    click_count: number;
}

export type AnalyticsDataType = {
    hourly_stats: Record<number, number>;
    daily_stats: Record<string, number>;
    weekly_stats: Record<string, number>;
    monthly_stats: Record<string, number>;
    os_stats: Record<string, number>;
    device_stats: Record<string, number>;
    browser_stats: Record<string, number>;
    geographic_data: GeoGraphicDataType[];
}

export type AnalyticsType = {
    top_performing_links: TopPerformingLinkType[];
    recent_activity: RecentActivityType[];
    analytics_stats: AnalyticsDataType;
}
