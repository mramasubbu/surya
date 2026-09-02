// Restaurant data — all information verified from official sources
// Sources: District.in (Zomato), Swiggy, Justdial, Google

export const restaurant = {
  name: 'Surya Multicuisine Restaurant & Cafe',
  shortName: 'Surya Restaurant',
  tagline: 'Multicuisine Dining in Ambattur, Chennai',
  description:
    'Surya Multicuisine Restaurant & Cafe offers a wide variety of cuisines including North Indian, South Indian, Chinese, Tandoori, Seafood, BBQ, and Continental dishes. Located on Vanagaram High Road in Ambattur, Chennai, we serve delicious food in a modern, family-friendly dining atmosphere.',
  shortDescription:
    'Multicuisine dining featuring North Indian, Chinese, Tandoori, Seafood & BBQ in Ambattur, Chennai.',

  address: {
    line1: '97, Vanagaram High Road',
    line2: 'Sivananda Nagar, Ambattur',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600053',
    country: 'India',
    full: '97, Vanagaram High Road, Sivananda Nagar, Ambattur, Chennai, Tamil Nadu 600053',
  },

  contact: {
    phone: '+918015553780',
    phoneDisplay: '+91 80155 53780',
    // WhatsApp availability not confirmed — using phone number
    whatsapp: '+918015553780',
    whatsappDisplay: '+91 80155 53780',
  },

  hours: {
    display: '11:00 AM – 11:00 PM',
    days: 'Monday – Sunday',
    note: 'Hours may vary. Please call to confirm.',
    open: '11:00',
    close: '23:00',
  },

  cuisines: [
    'North Indian',
    'South Indian',
    'Chinese',
    'Biryani',
    'Tandoori',
    'Seafood',
    'BBQ & Grill',
    'Continental',
    'Street Food',
  ],

  features: [
    'Dine-in',
    'Takeaway',
    'Home Delivery',
    'Family Dining',
    'Air Conditioned',
  ],

  costForTwo: '₹450 – ₹600',

  rating: {
    score: 4.1,
    count: 360,
    platform: 'Swiggy',
  },

  links: {
    swiggy:
      'https://www.swiggy.com/city/chennai/surya-multicuisine-restaurant-sivanandha-nagar-ambattur-rest1066929',
    district:
      'https://www.district.in/dining/chennai/surya-multicuisine-restaurant-3-ambattur',
    googleMaps:
      'https://www.google.com/maps/search/Surya+Multicuisine+Restaurant+Ambattur+Chennai',
    googleReviews:
      'https://www.google.com/maps/search/Surya+Multicuisine+Restaurant+97+Vanagaram+High+Road+Ambattur+Chennai',
    directions:
      'https://www.google.com/maps/dir/?api=1&destination=Surya+Multicuisine+Restaurant+97+Vanagaram+High+Road+Ambattur+Chennai+600053',
  },

  location: {
    lat: 13.1075187,
    lng: 80.1519345,
  },

  // No verified social media accounts found
  social: {
    instagram: null,
    facebook: null,
  },
} as const;

export const whatsappReservationMessage = (details: {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message?: string;
}) => {
  const lines = [
    `Hi, I would like to reserve a table at ${restaurant.name}.`,
    '',
    `Name: ${details.name}`,
    `Phone: ${details.phone}`,
    `Date: ${details.date}`,
    `Preferred Time: ${details.time}`,
    `Guests: ${details.guests}`,
  ];
  if (details.message) {
    lines.push(`Additional Message: ${details.message}`);
  }
  return lines.join('\n');
};

export const getWhatsAppUrl = (message: string) => {
  return `https://wa.me/${restaurant.contact.whatsapp.replace('+', '')}?text=${encodeURIComponent(message)}`;
};

export const getCallUrl = () => `tel:${restaurant.contact.phone}`;
