
export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  item: MenuItem;
  quantity: number;
}

export interface Order {
  [itemId: string]: OrderItem;
}

export interface MessageBoxState {
  isOpen: boolean;
  message: string;
  type?: 'info' | 'success' | 'error';
}
