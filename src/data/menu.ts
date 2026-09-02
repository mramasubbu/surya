// Menu data — prices verified from official menu cards (District.in / Zomato)
// Last verified: September 2026

export type DietType = 'veg' | 'non-veg' | 'egg';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  priceLabel?: string; // For items with multiple price points like "129/249/449"
  diet: DietType;
  description?: string;
  image?: string;
  popular?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'non-veg-starters',
    name: 'Non-Veg Starters',
    image: '/images/menu/chilli-chicken.jpg',
    items: [
      { id: 'nv-s-1', name: 'Chicken Lollipop', price: 159, diet: 'non-veg', popular: true },
      { id: 'nv-s-2', name: 'Chicken 65 Bone', price: 149, diet: 'non-veg', popular: true },
      { id: 'nv-s-3', name: 'Chicken 65 Boneless', price: 179, diet: 'non-veg' },
      { id: 'nv-s-4', name: 'Dragon Chicken', price: 179, diet: 'non-veg' },
      { id: 'nv-s-5', name: 'Garlic Chicken', price: 179, diet: 'non-veg' },
      { id: 'nv-s-6', name: 'Szechuan Chicken', price: 179, diet: 'non-veg' },
      { id: 'nv-s-7', name: 'Apollo Chicken', price: 179, diet: 'non-veg' },
      { id: 'nv-s-8', name: 'Chilli Chicken', price: 159, diet: 'non-veg', popular: true },
      { id: 'nv-s-9', name: 'Chicken Manchurian', price: 179, diet: 'non-veg' },
      { id: 'nv-s-10', name: 'Chicken Salt & Pepper', price: 179, diet: 'non-veg' },
      { id: 'nv-s-11', name: 'Ginger Chicken', price: 179, diet: 'non-veg' },
      { id: 'nv-s-12', name: 'Saucy Chicken Lollipop', price: 179, diet: 'non-veg' },
      { id: 'nv-s-13', name: 'Japan Chicken', price: 199, diet: 'non-veg' },
      { id: 'nv-s-14', name: 'Orange Chicken', price: 199, diet: 'non-veg' },
      { id: 'nv-s-15', name: 'Lemon Chicken', price: 199, diet: 'non-veg' },
      { id: 'nv-s-16', name: 'Crispy Chicken Pakoda B/L', price: 199, diet: 'non-veg' },
      { id: 'nv-s-17', name: 'Curry Leaves Chicken (65)', price: 199, diet: 'non-veg' },
      { id: 'nv-s-18', name: 'Coriander Chicken 65', price: 199, diet: 'non-veg' },
      { id: 'nv-s-19', name: 'Chicken 555', price: 199, diet: 'non-veg' },
      { id: 'nv-s-20', name: 'Finger Chicken', price: 249, diet: 'non-veg' },
      { id: 'nv-s-21', name: 'Drum Stick Chicken', price: 349, diet: 'non-veg' },
      { id: 'nv-s-22', name: 'Mur Mur Chicken', price: 199, diet: 'non-veg' },
      { id: 'nv-s-23', name: 'Honey Garlic Chicken', price: 199, diet: 'non-veg' },
      { id: 'nv-s-24', name: 'Guntur Chicken', price: 199, diet: 'non-veg' },
      { id: 'nv-s-25', name: 'Chicken Pepper Fry', price: 179, diet: 'non-veg' },
    ],
  },
  {
    id: 'egg-starters',
    name: 'Egg Starters',
    items: [
      { id: 'eg-s-1', name: 'Boiled Egg', price: 15, diet: 'egg' },
      { id: 'eg-s-2', name: 'Masala Omelette', price: 40, diet: 'egg' },
      { id: 'eg-s-3', name: 'Egg Podimas', price: 40, diet: 'egg' },
      { id: 'eg-s-4', name: 'Egg Masala', price: 129, diet: 'egg' },
      { id: 'eg-s-5', name: 'Chilli Egg', price: 149, diet: 'egg' },
      { id: 'eg-s-6', name: 'Egg Manchurian', price: 149, diet: 'egg' },
      { id: 'eg-s-7', name: 'Egg Pepper Fry', price: 149, diet: 'egg' },
      { id: 'eg-s-8', name: 'Stem Omelette', price: 40, diet: 'egg' },
    ],
  },
  {
    id: 'mutton-starters',
    name: 'Mutton Starters',
    items: [
      { id: 'mt-s-1', name: 'Mutton Chukka', price: 249, diet: 'non-veg', popular: true },
      { id: 'mt-s-2', name: 'Mutton Pepper Fry', price: 249, diet: 'non-veg' },
      { id: 'mt-s-3', name: 'Mutton Ghee Roast', price: 249, diet: 'non-veg' },
      { id: 'mt-s-4', name: 'Tawa Mutton', price: 249, diet: 'non-veg' },
      { id: 'mt-s-5', name: 'Chilli Mutton', price: 249, diet: 'non-veg' },
      { id: 'mt-s-6', name: 'Mutton Manchurian', price: 249, diet: 'non-veg' },
    ],
  },
  {
    id: 'seafood-starters',
    name: 'Seafood Starters',
    image: '/images/menu/seafood-platter.jpg',
    items: [
      { id: 'sf-s-1', name: 'Prawn Pepper Fry', price: 249, diet: 'non-veg' },
      { id: 'sf-s-2', name: 'Prawn 65', price: 249, diet: 'non-veg' },
      { id: 'sf-s-3', name: 'Chilli Prawn', price: 249, diet: 'non-veg' },
      { id: 'sf-s-4', name: 'Prawn Manchurian', price: 249, diet: 'non-veg' },
      { id: 'sf-s-5', name: 'Garlic Prawn', price: 249, diet: 'non-veg' },
      { id: 'sf-s-6', name: 'Dragon Prawn', price: 249, diet: 'non-veg' },
      { id: 'sf-s-7', name: 'Honey Garlic Prawn', price: 259, diet: 'non-veg' },
      { id: 'sf-s-8', name: 'Crab Lollipop', price: 249, diet: 'non-veg' },
      { id: 'sf-s-9', name: 'Fish Finger', price: 249, diet: 'non-veg' },
      { id: 'sf-s-10', name: 'Chilli Fish', price: 249, diet: 'non-veg' },
      { id: 'sf-s-11', name: 'Garlic Fish', price: 249, diet: 'non-veg' },
      { id: 'sf-s-12', name: 'Dragon Fish', price: 249, diet: 'non-veg' },
      { id: 'sf-s-13', name: 'Fish Salt & Pepper', price: 249, diet: 'non-veg' },
      { id: 'sf-s-14', name: 'Fish 65', price: 249, diet: 'non-veg' },
      { id: 'sf-s-15', name: 'Crab Pepper Fry', price: 299, diet: 'non-veg' },
      { id: 'sf-s-16', name: 'Vanjaram Fish Fry', price: 249, diet: 'non-veg' },
      { id: 'sf-s-17', name: 'Apollo Fish', price: 249, diet: 'non-veg' },
    ],
  },
  {
    id: 'veg-starters',
    name: 'Veg Starters',
    image: '/images/menu/paneer-butter-masala.jpg',
    items: [
      { id: 'vg-s-1', name: 'Gobi 65', price: 129, diet: 'veg' },
      { id: 'vg-s-2', name: 'Gobi Manchurian', price: 129, diet: 'veg' },
      { id: 'vg-s-3', name: 'Mushroom 65', price: 149, diet: 'veg' },
      { id: 'vg-s-4', name: 'Mushroom Manchurian', price: 149, diet: 'veg' },
      { id: 'vg-s-5', name: 'Paneer 65', price: 179, diet: 'veg', popular: true },
      { id: 'vg-s-6', name: 'Paneer Manchurian', price: 179, diet: 'veg' },
      { id: 'vg-s-7', name: 'Chilli Paneer', price: 179, diet: 'veg' },
      { id: 'vg-s-8', name: 'Dragon Paneer', price: 179, diet: 'veg' },
      { id: 'vg-s-9', name: 'Veg Manchurian', price: 129, diet: 'veg' },
      { id: 'vg-s-10', name: 'Chilli Gobi', price: 129, diet: 'veg' },
      { id: 'vg-s-11', name: 'Baby Corn 65', price: 149, diet: 'veg' },
      { id: 'vg-s-12', name: 'Baby Corn Manchurian', price: 149, diet: 'veg' },
      { id: 'vg-s-13', name: 'Crispy Corn', price: 149, diet: 'veg' },
      { id: 'vg-s-14', name: 'Mushroom Pepper Fry', price: 149, diet: 'veg' },
      { id: 'vg-s-15', name: 'Paneer Salt & Pepper', price: 179, diet: 'veg' },
      { id: 'vg-s-16', name: 'Garlic Mushroom', price: 149, diet: 'veg' },
    ],
  },
  {
    id: 'biryani',
    name: 'Biryani',
    image: '/images/menu/chicken-biryani.jpg',
    items: [
      { id: 'br-1', name: 'Chicken Biryani', price: 179, diet: 'non-veg', popular: true },
      { id: 'br-2', name: 'Chicken Dum Biryani', price: 199, diet: 'non-veg', popular: true },
      { id: 'br-3', name: 'Mutton Biryani', price: 249, diet: 'non-veg', popular: true },
      { id: 'br-4', name: 'Mutton Dum Biryani', price: 269, diet: 'non-veg' },
      { id: 'br-5', name: 'Prawn Biryani', price: 249, diet: 'non-veg' },
      { id: 'br-6', name: 'Fish Biryani', price: 249, diet: 'non-veg' },
      { id: 'br-7', name: 'Egg Biryani', price: 149, diet: 'egg' },
      { id: 'br-8', name: 'Veg Biryani', price: 149, diet: 'veg' },
      { id: 'br-9', name: 'Veg Dum Biryani', price: 169, diet: 'veg' },
      { id: 'br-10', name: 'Paneer Biryani', price: 179, diet: 'veg' },
      { id: 'br-11', name: 'Mushroom Biryani', price: 169, diet: 'veg' },
      { id: 'br-12', name: 'Chicken 65 Biryani', price: 219, diet: 'non-veg' },
      { id: 'br-13', name: 'Spl Chicken Biryani', price: 219, diet: 'non-veg' },
      { id: 'br-14', name: 'Boneless Chicken Biryani', price: 219, diet: 'non-veg' },
    ],
  },
  {
    id: 'tandoori-breads',
    name: 'Tandoori Breads',
    image: '/images/menu/naan-breads.jpg',
    items: [
      { id: 'tb-1', name: 'Tandoori Roti', price: 30, diet: 'veg' },
      { id: 'tb-2', name: 'Butter Roti', price: 40, diet: 'veg' },
      { id: 'tb-3', name: 'Butter Naan', price: 50, diet: 'veg', popular: true },
      { id: 'tb-4', name: 'Plain Naan', price: 40, diet: 'veg' },
      { id: 'tb-5', name: 'Garlic Naan', price: 50, diet: 'veg', popular: true },
      { id: 'tb-6', name: 'Masala Kulcha', price: 60, diet: 'veg' },
      { id: 'tb-7', name: 'Plain Kulcha', price: 40, diet: 'veg' },
      { id: 'tb-8', name: 'Aloo Kulcha', price: 60, diet: 'veg' },
      { id: 'tb-9', name: 'Aloo Paratha', price: 60, diet: 'veg' },
      { id: 'tb-10', name: 'Gobi Paratha', price: 60, diet: 'veg' },
      { id: 'tb-11', name: 'Onion Kulcha', price: 60, diet: 'veg' },
      { id: 'tb-12', name: 'Paneer Kulcha', price: 60, diet: 'veg' },
      { id: 'tb-13', name: 'Paneer Paratha', price: 60, diet: 'veg' },
      { id: 'tb-14', name: 'Butter Kulcha', price: 60, diet: 'veg' },
      { id: 'tb-15', name: 'Chicken Kulcha', price: 60, diet: 'non-veg' },
      { id: 'tb-16', name: 'Chicken Paratha', price: 60, diet: 'non-veg' },
      { id: 'tb-17', name: 'Mutton Kulcha', price: 80, diet: 'non-veg' },
      { id: 'tb-18', name: 'Mutton Paratha', price: 80, diet: 'non-veg' },
      { id: 'tb-19', name: 'Laccha Paratha', price: 60, diet: 'veg' },
      { id: 'tb-20', name: 'Chappathi', price: 50, diet: 'veg' },
      { id: 'tb-21', name: 'Pulka', price: 50, diet: 'veg' },
    ],
  },
  {
    id: 'bbq-grill',
    name: 'BBQ & Grill',
    image: '/images/menu/bbq-chicken.jpg',
    items: [
      { id: 'bbq-1', name: 'BBQ Chicken', priceLabel: '129 / 249 / 449', price: 129, diet: 'non-veg', popular: true },
      { id: 'bbq-2', name: 'Pepper BBQ', priceLabel: '129 / 249 / 449', price: 129, diet: 'non-veg' },
      { id: 'bbq-3', name: 'Lemon BBQ', priceLabel: '129 / 249 / 449', price: 129, diet: 'non-veg' },
      { id: 'bbq-4', name: 'Hot and Spicy BBQ', priceLabel: '129 / 249 / 449', price: 129, diet: 'non-veg' },
      { id: 'bbq-5', name: 'Grill Chicken', priceLabel: '299 / 499', price: 299, diet: 'non-veg' },
      { id: 'bbq-6', name: 'Pepper Grill Chicken', priceLabel: '249 / 449', price: 249, diet: 'non-veg' },
    ],
  },
  {
    id: 'meals',
    name: 'Meals',
    items: [
      { id: 'ml-1', name: 'Veg Meals (Dining)', price: 119, diet: 'veg' },
      { id: 'ml-2', name: 'Veg Meals (Parcel)', price: 99, diet: 'veg' },
      { id: 'ml-3', name: 'Non-Veg Meals (Dining)', price: 159, diet: 'non-veg' },
      { id: 'ml-4', name: 'Non-Veg Meals (Parcel)', price: 149, diet: 'non-veg' },
    ],
  },
  {
    id: 'beverages',
    name: 'Fresh Juices & Beverages',
    image: '/images/menu/fresh-juices.jpg',
    items: [
      { id: 'bv-1', name: 'Watermelon Juice', price: 60, diet: 'veg' },
      { id: 'bv-2', name: 'Grape Juice', price: 80, diet: 'veg' },
      { id: 'bv-3', name: 'Muskmelon Juice', price: 80, diet: 'veg' },
      { id: 'bv-4', name: 'Apple Juice', price: 100, diet: 'veg' },
      { id: 'bv-5', name: 'Pineapple Juice', price: 80, diet: 'veg' },
      { id: 'bv-6', name: 'Orange Juice', price: 80, diet: 'veg' },
      { id: 'bv-7', name: 'Pomegranate Juice', price: 100, diet: 'veg' },
      { id: 'bv-8', name: 'Sweet Lemon Juice', price: 80, diet: 'veg' },
      { id: 'bv-9', name: 'Mango Juice', price: 100, diet: 'veg' },
      { id: 'bv-10', name: 'Fig Juice', price: 100, diet: 'veg' },
      { id: 'bv-11', name: 'Kiwi Juice', price: 100, diet: 'veg' },
      { id: 'bv-12', name: 'Avocado Juice', price: 100, diet: 'veg' },
      { id: 'bv-13', name: 'Papaya Juice', price: 60, diet: 'veg' },
      { id: 'bv-14', name: 'Chikku Juice', price: 80, diet: 'veg' },
      { id: 'bv-15', name: 'Rose Milk', price: 40, diet: 'veg' },
      { id: 'bv-16', name: 'Beetroot Juice', price: 60, diet: 'veg' },
      { id: 'bv-17', name: 'Gooseberry Juice', price: 60, diet: 'veg' },
      { id: 'bv-18', name: 'Dragon Fruit Juice', price: 100, diet: 'veg' },
      { id: 'bv-19', name: 'Strawberry Juice', price: 100, diet: 'veg' },
      { id: 'bv-20', name: 'Badam Milk', price: 50, diet: 'veg' },
      { id: 'bv-21', name: 'Butter Milk', price: 40, diet: 'veg' },
      { id: 'bv-22', name: 'Sweet Lassi', price: 50, diet: 'veg' },
      { id: 'bv-23', name: 'Salt Lassi', price: 40, diet: 'veg' },
      { id: 'bv-24', name: 'Lemon Soda', price: 50, diet: 'veg' },
      { id: 'bv-25', name: 'Lemon Mint Soda', price: 60, diet: 'veg' },
      { id: 'bv-26', name: 'Lemon Juice', price: 40, diet: 'veg' },
      { id: 'bv-27', name: 'Lemon Mint Juice', price: 50, diet: 'veg' },
      { id: 'bv-28', name: 'Lemon Mint Mojito', price: 80, diet: 'veg' },
      { id: 'bv-29', name: 'Blue Curacao Mojito', price: 100, diet: 'veg' },
      { id: 'bv-30', name: 'Watermelon Mojito', price: 120, diet: 'veg' },
      { id: 'bv-31', name: 'Strawberry Mojito', price: 120, diet: 'veg' },
    ],
  },
];

// Helper to get all items across categories
export const getAllMenuItems = (): MenuItem[] => {
  return menuCategories.flatMap((cat) => cat.items);
};

// Helper to get popular items
export const getPopularItems = (): MenuItem[] => {
  return getAllMenuItems().filter((item) => item.popular);
};

// Category icon mapping for the menu tabs
export const categoryIcons: Record<string, string> = {
  'non-veg-starters': '🍗',
  'egg-starters': '🥚',
  'mutton-starters': '🥩',
  'seafood-starters': '🦐',
  'veg-starters': '🥦',
  'biryani': '🍚',
  'tandoori-breads': '🫓',
  'bbq-grill': '🔥',
  'meals': '🍽️',
  'beverages': '🥤',
};
