/**
 * Sri Kankatala Jewellers — Category Data
 * Categories for the Shop by Category section and catalogue filters.
 */

import CLOUDINARY_IMAGES from '@/lib/images';

const categories = [
  {
    name: 'Necklaces',
    slug: 'necklaces',
    image: CLOUDINARY_IMAGES.categories.Necklaces,
    description: 'Exquisite necklaces for every occasion',
  },
  {
    name: 'Harams',
    slug: 'harams',
    image: CLOUDINARY_IMAGES.categories.Harams,
    description: 'Grand long necklaces for bridal wear',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    image: CLOUDINARY_IMAGES.categories.Earrings,
    description: 'From studs to chandbalis',
  },
  {
    name: 'Jhumkas',
    slug: 'jhumkas',
    image: CLOUDINARY_IMAGES.categories.Jumkas,
    description: 'Traditional South Indian jhumka earrings',
  },
  {
    name: 'Bangles',
    slug: 'bangles',
    image: CLOUDINARY_IMAGES.categories.Bangles,
    description: 'Stunning bangles and kadas',
  },
  {
    name: 'Rings',
    slug: 'rings',
    image: CLOUDINARY_IMAGES.categories.Rings,
    description: 'Statement rings for men and women',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    image: CLOUDINARY_IMAGES.categories.Bracelets,
    description: 'Elegant bracelets and chain links',
  },
  {
    name: 'Pendants',
    slug: 'pendants',
    image: CLOUDINARY_IMAGES.categories.Pendants,
    description: 'Beautiful pendants in varied designs',
  },
  {
    name: 'Mangalsutras',
    slug: 'mangalsutras',
    image: CLOUDINARY_IMAGES.categories.Mangalasustras,
    description: 'Sacred mangalsutras crafted with care',
  },
  {
    name: 'Anklets',
    slug: 'anklets',
    image: CLOUDINARY_IMAGES.categories.Anklets,
    description: 'Graceful anklets with traditional charm',
  },
  {
    name: 'Nose Pins',
    slug: 'nose-pins',
    image: CLOUDINARY_IMAGES.categories['Nose Pins'],
    description: 'Delicate nose pins and nose rings',
  },
  {
    name: 'Papidi',
    slug: 'papidi',
    image: CLOUDINARY_IMAGES.categories.Papidi,
    description: 'Traditional bridal papidi billa',
  },
  {
    name: 'Watches',
    slug: 'watches',
    image: CLOUDINARY_IMAGES.categories.Watches,
    description: 'Premium gold and silver watches',
  },
];

export default categories;
