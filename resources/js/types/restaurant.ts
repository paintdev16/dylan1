export type RestaurantTableStatus =
    'available' | 'occupied' | 'reserved' | 'out_of_service';

export interface TableSession {
    id: number;
    restaurant_table_id: number;
    waiter_id: number;
    customer_count: number;
    status: 'open' | 'closed';
    opened_at: string;
    closed_at: string | null;
    waiter?: {
        id: number;
        name: string;
    };
    bill?: Bill;
}

export interface CashRegisterSession {
    id: number;
    user_id: number;
    opening_amount: number;
    closing_amount: number | null;
    expected_amount: number | null;
    difference: number | null;
    notes: string | null;
    status: 'open' | 'closed';
    opened_at: string;
    closed_at: string | null;
}

export interface CashRegisterSummary {
    cash_total: number;
    card_total: number;
    digital_total: number;
    total_collected: number;
    expected_cash: number;
    transactions_count: number;
}

export interface RestaurantTable {
    id: number;
    number: number;
    capacity: number;
    status: RestaurantTableStatus;
    active_session?: TableSession | null;
}

export type BillOrderType = 'dine_in' | 'takeout';

export type BillStatus = 'open' | 'closed';

export type PaymentMethod = 'cash' | 'card' | 'yape' | 'plin';

export interface Payment {
    id: number;
    bill_id: number;
    cashier_id: number;
    payment_method: PaymentMethod;
    amount: number;
    receipt_number: string | null;
    created_at: string;
    cashier?: {
        id: number;
        name: string;
    };
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number | null;
    menu_modality_id: number | null;
    quantity: number;
    notes: string | null;
    unit_price: number;
    subtotal: number;
    kitchen_status: 'pending' | 'in_preparation' | 'ready' | 'delivered';
    product?: Product | null;
    menu_modality?: {
        id: number;
        name: string;
        price: number;
    } | null;
    daily_menu_products?: DailyMenuProduct[];
    is_cancelled?: boolean;
}

export interface Order {
    id: number;
    bill_id: number;
    user_id: number;
    status: 'pending' | 'sent_to_kitchen' | 'completed';
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
    items?: OrderItem[];
    bill?: Bill;
}

export interface Bill {
    id: number;
    table_id: number | null;
    opening_waiter_id: number;
    order_type: BillOrderType;
    status: BillStatus;
    opened_at: string;
    closed_at: string | null;
    total_amount: number;
    paid_amount: number;
    balance: number;
    restaurant_table?: RestaurantTable | null;
    opening_waiter?: {
        id: number;
        name: string;
    };
    orders?: Order[];
    payments?: Payment[];
}

export interface MenuCategory {
    id: number;
    name: string;
    code: 'food' | 'beverages';
    display_order: number;
    active: boolean;
    has_versions: boolean;
    requires_presentation: boolean;
    menu_subcategories?: MenuSubcategory[];
}

export type MenuSubcategoryType = {
    id: number;
    menu_subcategory_id: number;
    name: string;
    code: 'main_course' | 'starter' | 'dessert';
    display_order: number;
    active: boolean;
};

export type MenuSubcategory = {
    id: number;
    menu_category_id: number;
    name: string;
    code: 'economic_menu' | 'special_dishes';
    display_order: number;
    active: boolean;
    types?: MenuSubcategoryType[];
};

export type ProductType = 'simple' | 'prepared';

export type ProductStatus = 'active' | 'inactive';

export type Product = {
    id: number;
    menu_category_id: number;
    menu_subcategory_id: number | null;
    menu_subcategory_type_id: number | null;
    name: string;
    description: string | null;
    presentation: string | null;
    price: number;
    image: string | null;
    type: ProductType;
    status: ProductStatus;
    has_daily_menu_products?: boolean;
    daily_menu_quantity?: number | null;

    menu_category?: MenuCategory;
    menu_subcategory?: MenuSubcategory;
    menu_subcategory_type?: MenuSubcategoryType;
    product_stock?: ProductStock;
};

export type ProductStock = {
    id: number;
    product_id: number;
    quantity: number;
    movements?: ProductStockMovement[];
};

export type ProductStockMovementType = 'stock_in' | 'stock_out' | 'adjustment';

export type ProductStockMovement = {
    id: number;
    product_stock_id: number;
    type: ProductStockMovementType;
    quantity: number;
    quantity_before: number;
    quantity_after: number;
    description: string | null;
    created_at: string;
    updated_at: string;
};

export type DailyMenuProductSummary = {
    id: number;
    product_id: number;
    product_name: string;
    price: number | string;
    quantity_available: number;
    display_order: number;
    active: boolean;
};

export type DailyMenu = {
    id: number;
    date: string;
    formatted_date: string;
    active: boolean;
    products: DailyMenuProductSummary[];
};

export interface DailyMenuProduct {
    id: number;
    daily_menu_id: number;
    dailyMenu: DailyMenu;

    product_id: number;
    product: Product;

    price: number | string;
    quantity_available: number;
    display_order: number;
    active: boolean;
}

export interface MenuModality {
    id: number;
    daily_menu_id: number;
    code: 'full_menu' | 'main_only' | 'starter_dessert';
    name: string;
    description: string | null;
    price: number;
    display_order: number;
    active: boolean;
    items?: MenuModalityItem[];
}

export interface MenuModalityItem {
    daily_menu_product_id: number;
    item_type: 'main_course' | 'starter' | 'dessert';
    quantity: number;
}
