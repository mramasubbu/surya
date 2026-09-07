/**
 * Delivery Radius & Pincode Coverage Service
 * Evaluates whether a guest's postal PIN code falls within the restaurant's
 * configured delivery radius limit (in KM) from Surya Multicuisine Restaurant
 * located at 97, Vanagaram High Road, Sivananda Nagar, Ambattur, Chennai - 600053.
 */

export interface PincodeLocation {
  pincode: string;
  locality: string;
  area: string;
  approxDistanceKm: number; // Approximate road/driving distance from Ambattur restaurant
}

export interface DeliveryRadiusCheckResult {
  pincode: string;
  locality: string;
  approxDistanceKm: number | null;
  maxRadiusKm: number;
  isDeliverable: boolean;
  status: 'within_radius' | 'outside_radius' | 'invalid_pincode' | 'out_of_state';
  title: string;
  message: string;
}

/**
 * Registry of Chennai & Suburbs Pincodes with measured distances from
 * Surya Multicuisine Restaurant, Ambattur (PIN: 600053).
 */
export const CHENNAI_PINCODE_DIRECTORY: Record<string, PincodeLocation> = {
  // --- Core Ambattur & Immediate Neighborhood (0 – 3.0 KM) ---
  '600053': {
    pincode: '600053',
    locality: 'Ambattur / Sivananda Nagar / OT',
    area: 'Ambattur Core',
    approxDistanceKm: 1.0,
  },
  '600058': {
    pincode: '600058',
    locality: 'Ambattur Industrial Estate / SIDCO / Pattaravakkam',
    area: 'Ambattur IE',
    approxDistanceKm: 2.2,
  },
  '600098': {
    pincode: '600098',
    locality: 'Mogappair West & East / Golden Flats',
    area: 'Mogappair',
    approxDistanceKm: 2.8,
  },
  '600101': {
    pincode: '600101',
    locality: 'Mogappair West Extension / Nolambur Phase 1',
    area: 'Nolambur',
    approxDistanceKm: 3.0,
  },

  // --- Adjoining Suburbs (3.1 – 5.0 KM) ---
  '600077': {
    pincode: '600077',
    locality: 'Vanagaram / Nolambur / Ayanambakkam',
    area: 'Vanagaram',
    approxDistanceKm: 3.4,
  },
  '600080': {
    pincode: '600080',
    locality: 'Korattur / Padi / Lucas TVS',
    area: 'Korattur',
    approxDistanceKm: 3.8,
  },
  '600055': {
    pincode: '600055',
    locality: 'Thirumullaivoyal / Vaishnavi Nagar',
    area: 'Thirumullaivoyal',
    approxDistanceKm: 4.2,
  },
  '600037': {
    pincode: '600037',
    locality: 'Anna Nagar West Extension / Mogappair East',
    area: 'Anna Nagar West Ext',
    approxDistanceKm: 4.5,
  },
  '600095': {
    pincode: '600095',
    locality: 'Maduravoyal / Alapakkam / Meenakshi Dental',
    area: 'Maduravoyal',
    approxDistanceKm: 4.8,
  },

  // --- Extended Suburbs (5.1 – 8.0 KM) ---
  '600054': {
    pincode: '600054',
    locality: 'Avadi / TNHB Colony / Gandhi Nagar',
    area: 'Avadi',
    approxDistanceKm: 5.8,
  },
  '600049': {
    pincode: '600049',
    locality: 'Villivakkam / ICF Colony / Kolathur South',
    area: 'Villivakkam',
    approxDistanceKm: 6.2,
  },
  '600071': {
    pincode: '600071',
    locality: 'Avadi Camp / Kamaraj Nagar / Mittanamalli',
    area: 'Avadi Camp',
    approxDistanceKm: 6.8,
  },
  '600099': {
    pincode: '600099',
    locality: 'Kolathur / Lakshmipuram / Retteri',
    area: 'Kolathur',
    approxDistanceKm: 7.2,
  },
  '600040': {
    pincode: '600040',
    locality: 'Anna Nagar / Shenoy Nagar / Roundtana',
    area: 'Anna Nagar',
    approxDistanceKm: 7.5,
  },
  '600107': {
    pincode: '600107',
    locality: 'Koyambedu / Chinmaya Nagar / CMBT',
    area: 'Koyambedu',
    approxDistanceKm: 7.8,
  },

  // --- Outer Limits (8.1 – 15.0 KM) ---
  '600062': {
    pincode: '600062',
    locality: 'Pattabiram / Hindu College',
    area: 'Pattabiram',
    approxDistanceKm: 8.8,
  },
  '600056': {
    pincode: '600056',
    locality: 'Poonamallee / Senneerkuppam',
    area: 'Poonamallee',
    approxDistanceKm: 9.2,
  },
  '600116': {
    pincode: '600116',
    locality: 'Porur / Mugalivakkam / Ramapuram',
    area: 'Porur',
    approxDistanceKm: 9.5,
  },
  '600072': {
    pincode: '600072',
    locality: 'Pattabiram / Thirunindravur',
    area: 'Thirunindravur',
    approxDistanceKm: 10.5,
  },
  '600026': {
    pincode: '600026',
    locality: 'Vadapalani / Ashok Nagar',
    area: 'Vadapalani',
    approxDistanceKm: 10.0,
  },
  '600023': {
    pincode: '600023',
    locality: 'Ayanavaram / Kilpauk Water Works',
    area: 'Ayanavaram',
    approxDistanceKm: 8.9,
  },
  '600082': {
    pincode: '600082',
    locality: 'Perambur / Agaram',
    area: 'Perambur',
    approxDistanceKm: 10.8,
  },
  '600010': {
    pincode: '600010',
    locality: 'Kilpauk / Kellys',
    area: 'Kilpauk',
    approxDistanceKm: 11.2,
  },
  '600030': {
    pincode: '600030',
    locality: 'Shenoy Nagar / Aminjikarai',
    area: 'Aminjikarai',
    approxDistanceKm: 9.8,
  },
  '600034': {
    pincode: '600034',
    locality: 'Nungambakkam / Sterling Road',
    area: 'Nungambakkam',
    approxDistanceKm: 13.0,
  },
  '600017': {
    pincode: '600017',
    locality: 'T. Nagar / Panagal Park',
    area: 'T. Nagar',
    approxDistanceKm: 13.5,
  },
  '600089': {
    pincode: '600089',
    locality: 'Ramapuram / Manapakkam',
    area: 'Ramapuram',
    approxDistanceKm: 12.0,
  },
  '600028': {
    pincode: '600028',
    locality: 'R.A. Puram / MRC Nagar',
    area: 'R.A. Puram',
    approxDistanceKm: 18.0,
  },
  '600004': {
    pincode: '600004',
    locality: 'Mylapore / Santhome',
    area: 'Mylapore',
    approxDistanceKm: 17.5,
  },
  '600020': {
    pincode: '600020',
    locality: 'Adyar / Besant Nagar',
    area: 'Adyar',
    approxDistanceKm: 20.0,
  },
  '600096': {
    pincode: '600096',
    locality: 'Perungudi / OMR',
    area: 'OMR',
    approxDistanceKm: 22.0,
  },
  '600100': {
    pincode: '600100',
    locality: 'Medavakkam / Pallikaranai',
    area: 'South Chennai',
    approxDistanceKm: 24.0,
  },
};

/**
 * Checks whether a given 6-digit postal code falls within the restaurant's
 * delivery radius limit (in KM).
 *
 * @param pincode 6-digit Indian PIN code string
 * @param maxRadiusKm Configured delivery radius limit in KM (e.g., 3.0, 5.0)
 * @returns Comprehensive DeliveryRadiusCheckResult
 */
export function checkDeliveryRadius(
  pincode: string,
  maxRadiusKm: number
): DeliveryRadiusCheckResult {
  const cleanPin = (pincode || '').replace(/\D/g, '').trim();

  // Validate format
  if (!cleanPin || cleanPin.length !== 6) {
    return {
      pincode: cleanPin,
      locality: '',
      approxDistanceKm: null,
      maxRadiusKm,
      isDeliverable: false,
      status: 'invalid_pincode',
      title: 'Invalid PIN Code',
      message: 'Please enter a valid 6-digit postal PIN code.',
    };
  }

  // Non-Chennai or out-of-region check
  if (!cleanPin.startsWith('600')) {
    return {
      pincode: cleanPin,
      locality: 'Outside Chennai Region',
      approxDistanceKm: 30.0,
      maxRadiusKm,
      isDeliverable: false,
      status: 'out_of_state',
      title: 'Outside Delivery Coverage',
      message: `PIN code ${cleanPin} is located outside our local delivery zone. Surya Restaurant delivers only within ${maxRadiusKm} KM of our Ambattur, Chennai kitchen.`,
    };
  }

  // Check known directory
  const entry = CHENNAI_PINCODE_DIRECTORY[cleanPin];

  if (entry) {
    const isDeliverable = entry.approxDistanceKm <= maxRadiusKm;

    if (isDeliverable) {
      return {
        pincode: cleanPin,
        locality: entry.locality,
        approxDistanceKm: entry.approxDistanceKm,
        maxRadiusKm,
        isDeliverable: true,
        status: 'within_radius',
        title: 'Delivery Available!',
        message: `Great! ${entry.locality} is approximately ${entry.approxDistanceKm} KM away, within our ${maxRadiusKm} KM delivery range.`,
      };
    } else {
      return {
        pincode: cleanPin,
        locality: entry.locality,
        approxDistanceKm: entry.approxDistanceKm,
        maxRadiusKm,
        isDeliverable: false,
        status: 'outside_radius',
        title: 'Exceeds Delivery Radius',
        message: `Sorry, ${entry.locality} is ~${entry.approxDistanceKm} KM away from our restaurant. Our doorstep delivery limit is currently set to ${maxRadiusKm} KM.`,
      };
    }
  }

  // Fallback for 600xxx PIN codes not explicitly in directory:
  // PIN codes starting with 60005x, 60007x, 60008x are West/North Chennai (~3–8 km)
  // Other 600xxx are central/south/east Chennai (> 10 km)
  let estimatedDistance = 12.0;
  let estimatedLocality = 'Chennai Suburb';

  if (cleanPin.startsWith('60005') || cleanPin.startsWith('60007') || cleanPin.startsWith('60008') || cleanPin.startsWith('60009')) {
    estimatedDistance = 6.0;
    estimatedLocality = 'North / West Chennai Suburb';
  } else {
    estimatedDistance = 14.0;
    estimatedLocality = 'Central / South Chennai';
  }

  const isDeliverable = estimatedDistance <= maxRadiusKm;

  return {
    pincode: cleanPin,
    locality: estimatedLocality,
    approxDistanceKm: estimatedDistance,
    maxRadiusKm,
    isDeliverable,
    status: isDeliverable ? 'within_radius' : 'outside_radius',
    title: isDeliverable ? 'Delivery Available' : 'Exceeds Delivery Radius',
    message: isDeliverable
      ? `PIN code ${cleanPin} (~${estimatedDistance} KM) is within our ${maxRadiusKm} KM delivery zone.`
      : `PIN code ${cleanPin} is estimated at ~${estimatedDistance} KM from our Ambattur kitchen, exceeding our ${maxRadiusKm} KM delivery limit.`,
  };
}
