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
  siteUrl: 'https://srikankatala.com', // Update in Phase 3

  // Contact — replace with verified client details
  phone: '+91 95056 08181',
  whatsappNumber: '919505608181', // Digits only, with country code
  email: 'info@srikankatala.com',

  // Showroom address — to be confirmed by client
  address: {
    line1: 'Shop No. 20, MGM Complex',
    line2: 'Market Road, Maruthi Nagar',
    city: 'Ravulapalem',
    state: 'Andhra Pradesh',
    pincode: '533238',
    country: 'India',
  },

  // Business hours — to be confirmed
  hours: {
    weekdays: '10:00 AM – 9:00 PM',
    weekends: '10:00 AM – 9:00 PM',
    closed: null,
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
