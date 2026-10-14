/**
 * Sri Kankatala Jewellers — Business Configuration
 * All client-specific details in one place for easy updates.
 */

const siteConfig = {
  businessName: 'Sri Kankatala Jewellers',
  shortName: 'SKJ',
  tagline: 'Timeless Jewellery, Crafted with Tradition',
  description:
    'Discover exquisite gold and silver jewellery at Sri Kankatala Jewellers. Browse our curated collections of necklaces, bangles, rings, earrings and more.',
  siteUrl: 'https://srikankatalajewellers.in',

  // Contact — replace with verified client details
  phone: '+91 95056 08181',
  whatsappNumber: '919505608181', // Digits only, with country code
  email: 'info@srikankatalajewellers.in',

  // Showroom address — to be confirmed by client
  address: {
    line1: 'Shop No. 20, MGM Complex',
    line2: 'Market Road, Maruthi Nagar',
    city: 'Ravulapalem',
    state: 'Andhra Pradesh',
    pincode: '533238',
    country: 'India',
  },

  // Business hours — verified with store
  hours: {
    weekdays: '10:00 AM – 8:30 PM',
    weekends: '10:00 AM – 8:30 PM (Sunday Closed)',
    closed: 'Sunday',
  },

  // Social links — add actual URLs when confirmed
  social: {
    instagram: '#',
    facebook: '#',
    youtube: '#',
  },

  // Brand colours (mirror of Tailwind config for JS usage)
  colors: {
    red: '#FD0100',
    olive: '#5F5F01',
    deepOlive: '#343500',
    gold: '#C9A34A',
    ivory: '#FFF9EC',
    charcoal: '#292821',
    muted: '#74746C',
    border: '#E7E0D2',
  },

  currency: 'INR',
  currencySymbol: '₹',
};

export default siteConfig;
