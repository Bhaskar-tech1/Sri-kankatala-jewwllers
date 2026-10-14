import ContactClient from '@/components/contact/ContactClient';

export const metadata = {
  title: 'Contact Sri Kankatala Jewellers | Ravulapalem',
  description:
    'Find Sri Kankatala Jewellers on Market Road, Maruthi Nagar, Ravulapalem, Andhra Pradesh. Contact our jewellery showroom for bridal jewellery, gold rates, and custom orders.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Sri Kankatala Jewellers | Ravulapalem',
    description:
      'Find Sri Kankatala Jewellers on Market Road, Maruthi Nagar, Ravulapalem, Andhra Pradesh. Contact our jewellery showroom for bridal jewellery, gold rates, and custom orders.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
