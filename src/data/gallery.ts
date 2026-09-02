export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: 'food' | 'interior' | 'ambience';
}

export const galleryImages: GalleryImage[] = [
  { id: 'g1', src: '/images/restaurant/hero-food-spread.jpg', alt: 'Multicuisine food spread with biryani, tandoori, and naan', category: 'food' },
  { id: 'g2', src: '/images/menu/chicken-biryani.jpg', alt: 'Chicken biryani in traditional copper handi', category: 'food' },
  { id: 'g3', src: '/images/menu/tandoori-chicken.jpg', alt: 'Tandoori chicken with mint chutney', category: 'food' },
  { id: 'g4', src: '/images/menu/chilli-chicken.jpg', alt: 'Indo-Chinese chilli chicken', category: 'food' },
  { id: 'g5', src: '/images/menu/seafood-platter.jpg', alt: 'Seafood platter with prawns and fish', category: 'food' },
  { id: 'g6', src: '/images/restaurant/interior-01.jpg', alt: 'Restaurant dining area with modern décor', category: 'interior' },
  { id: 'g7', src: '/images/menu/naan-breads.jpg', alt: 'Assorted tandoori breads fresh from the oven', category: 'food' },
  { id: 'g8', src: '/images/menu/paneer-butter-masala.jpg', alt: 'Paneer butter masala with creamy gravy', category: 'food' },
  { id: 'g9', src: '/images/menu/bbq-chicken.jpg', alt: 'BBQ chicken on a sizzling grill plate', category: 'food' },
  { id: 'g10', src: '/images/menu/fresh-juices.jpg', alt: 'Fresh fruit juices - watermelon, orange, and pomegranate', category: 'food' },
];

export const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Food' },
  { id: 'interior', label: 'Interior' },
  { id: 'ambience', label: 'Ambience' },
] as const;
