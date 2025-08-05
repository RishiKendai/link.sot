import type { GeoGraphicDataType } from '../analytics/types';

export type LAnalyticType = {
    short_link: string;
    original_link: string;
    total_clicks: number;
    qr_clicks: number;
    direct_clicks: number;
    unique_visitors: number;
    created_on: string;
    expiries_on: string;
    is_password_protected: boolean;
    last_clicked_at: string;
    last_click_browser: string;
    last_click_device: string;
    last_click_from: string;
    hourly_stats: Record<number, number>;
    daily_stats: Record<string, number>;
    weekly_stats: Record<string, number>;
    monthly_stats: Record<string, number>;
    os_stats: Record<string, number>;
    device_stats: Record<string, number>;
    browser_stats: Record<string, number>;
    geographic_data: GeoGraphicDataType[];
}
