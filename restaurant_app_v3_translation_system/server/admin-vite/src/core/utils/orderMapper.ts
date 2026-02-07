import type { CanonicalOrder, OrderMode, OrderSource, OrderStatus } from '../../types/order';

const BAR_CATEGORIES = [
    'Cafea/Ciocolată/Ceai', 'Cafea/Ciocolata/Ceai',
    'Răcoritoare', 'Racoritoare',
    'Băuturi și Coctailuri', 'Bauturi si Coctailuri',
    'Băuturi Spirtoase', 'Bauturi Spirtoase',
    'Coctailuri Non-Alcoolice', 'Cocktailuri Non-Alcoolice',
    'Vinuri', 'Bere'
];

function isBarCategory(category: string | null): boolean {
    if (!category) return false;
    return BAR_CATEGORIES.some(bc => category.includes(bc)) ||
        category.toLowerCase().includes('băuturi') ||
        category.toLowerCase().includes('bauturi');
}

/**
 * Maps a raw order from the backend (legacy format) to the CanonicalOrder format.
 */
export function mapRawOrderToCanonical(raw: any): CanonicalOrder {
    // Parse items if they are still a string
    let items = raw.items;
    if (typeof items === 'string') {
        try {
            items = JSON.parse(items);
        } catch (e) {
            items = [];
        }
    }

    // Map status
    let status: OrderStatus = raw.status || 'Pending:';
    // Normalize legacy/standard statuses to unconventional project status "Pending:"
    if (status === ('pending' as any) || status === ('confirmed' as any)) status = 'Pending:';

    const toUtc = (ts: string | null): string | null => {
        if (!ts) return null;
        // If timestamp has no timezone info (no Z, no +HH:MM), treat as UTC
        if (!ts.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(ts)) {
            return ts.replace(' ', 'T') + 'Z';
        }
        return ts;
    };

    // Map type (OrderMode)
    let type: OrderMode = 'dine_in';
    if (raw.type === 'delivery') type = 'Delivery' as OrderMode;
    else if (raw.type === 'takeout') type = 'takeout';
    else if (raw.type === 'drive_thru') type = 'drive_thru';
    else if (raw.type === 'here') type = 'dine_in';

    // Map source
    let source: OrderSource = 'POS';
    if (raw.platform === 'KIOSK' || raw.order_source === 'KIOSK_SELF_SERVICE') source = 'KIOSK';
    else if (raw.platform === 'MOBILE_APP') source = 'QR';
    else if (raw.order_source === 'DELIVERY' || raw.platform === 'delivery') source = 'DELIVERY';
    else if (raw.platform === 'pos') source = 'POS';

    return {
        id: raw.id,
        code: raw.code || raw.order_number || `#${raw.id}`,
        status,
        type,
        source,
        table: raw.table_number || raw.table || null,
        waiter_id: raw.waiter_id || null,
        courier_id: raw.courier_id || null,
        customer: {
            name: raw.customer_name || null,
            phone: raw.customer_phone || null,
            email: raw.customer_email || null,
        },
        delivery: {
            address: raw.delivery_address || null,
            notes: raw.delivery_notes || null,
        },
        drive_thru: {
            lane_number: raw.lane_number || null,
            car_plate: raw.car_plate || null,
        },
        notes: {
            general: raw.general_notes || raw.notes || null,
            kitchen: raw.food_notes || null,
            bar: raw.drink_notes || null,
        },
        totals: {
            subtotal: raw.subtotal || 0,
            discount: raw.discount || 0,
            vat: raw.vat || 0,
            total: raw.total || 0,
            currency: raw.currency || 'RON',
        },
        timestamps: {
            created_at: toUtc(raw.timestamp || raw.created_at),
            updated_at: toUtc(raw.updated_at),
            ready_at: toUtc(raw.ready_at),
            delivered_at: toUtc(raw.delivered_timestamp),
            paid_at: toUtc(raw.paid_timestamp),
            cancelled_at: toUtc(raw.cancelled_timestamp),
        },
        is_paid: !!raw.is_paid,
        is_cancelled: raw.status === 'cancelled' || !!raw.is_cancelled,
        is_together: !!raw.is_together,
        payment: {
            method: raw.payment_method || null,
        },
        external: {
            friendsride_order_id: raw.friendsride_order_id || null,
        },
        location_id: raw.location_id || 1,
        items: (items || []).map((item: any) => ({
            id: item.itemId || item.item_id || item.id || Math.random().toString(36).substr(2, 9),
            product_id: item.product_id || item.productId || 0,
            name: item.name || 'Produs',
            qty: item.quantity || item.qty || 1,
            unit_price: item.price || item.unit_price || 0,
            total: (item.price || item.unit_price || 0) * (item.quantity || item.qty || 1),
            station: item.station || (isBarCategory(item.category || item.category_name) ? 'bar' : 'kitchen'),
            notes: item.notes || null,
            options: item.options || [],
            customizations: item.customizations || [],
        })),
    };
}
