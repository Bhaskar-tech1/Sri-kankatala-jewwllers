'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, CheckCircle2, AlertCircle,
  ImagePlus, Loader2
} from 'lucide-react';

const CATEGORIES = [
  'Necklaces',
  'Chokers',
  'Harams',
  'Kasumala / Temple Jewellery',
  'Earrings',
  'Jhumkas',
  'Chandbalis',
  'Studs',
  'Bangles',
  'Kadas',
  'Bracelets',
  'Rings',
  'Pendants',
  'Mangalsutras / Nallapusalu',
  'Anklets (Payal / Pattilu)',
  'Nose Pins / Mukkupudaka',
  'Maang Tikka / Papidi Billa',
  'Vaddanam (Waist Belts)',
  'Vanki (Armlets / Bajuband)',
  'Chains',
  'Coins (Gold & Silver)',
  'Silver Articles & Pooja Items',
  'Idols & Murthis',
  'Watches',
  'Other',
];

export default function AddProductPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('gold');
  const [audience, setAudience] = useState('women');
  const [category, setCategory] = useState('Necklaces');
  const [customCategory, setCustomCategory] = useState('');
  const [purity, setPurity] = useState('22K');
  const [weightGrams, setWeightGrams] = useState('');
  const [price, setPrice] = useState('');
  const [featured, setFeatured] = useState(false);

  // Image Upload State
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');

  // Submit State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check Admin Authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/check');
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          setCheckingAuth(false);
        }
      } catch {
        router.push('/admin/login');
      }
    }
    checkAuth();
  }, [router]);

  // Adjust default purity based on material
  useEffect(() => {
    if (material === 'gold') {
      setPurity('22K');
    } else {
      setPurity('92.5 Sterling');
    }
  }, [material]);

  // Automatic upload to Cloudinary upon selecting an image
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image upload failed');
      }

      setCloudinaryUrl(data.url);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(`Image Upload Error: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (uploadingImage) {
      setError('Please wait for the image upload to complete.');
      return;
    }

    if (!cloudinaryUrl) {
      setError('Please select a product image.');
      return;
    }

    setSubmitting(true);

    try {
      const finalCategory = category === 'Other' ? (customCategory.trim() || 'Other') : category;

      const payload = {
        name: name.trim(),
        description: description.trim(),
        material,
        audience,
        category: finalCategory,
        purity,
        weightGrams: parseFloat(weightGrams) || 0,
        price: parseFloat(price) || 0,
        stockStatus: 'in_stock', // Always in stock when added
        featured,
        images: [cloudinaryUrl],
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C8102E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                  Add New Product
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Upload to Cloudinary & Firestore directly
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2.5">
              <div
                style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px' }}
                className="rounded-full overflow-hidden flex items-center justify-center bg-white shadow-xs border border-gray-100 flex-shrink-0"
              >
                <img
                  src="/SKJlogo.png"
                  alt="SKJ Logo"
                  style={{ width: '38px', height: '38px', maxWidth: '38px', maxHeight: '38px', objectFit: 'contain' }}
                  className="block"
                />
              </div>
              <span className="font-serif font-semibold text-gray-800 text-sm">
                Sri Kankatala Jewellers
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Product successfully published to Cloud Firestore! Redirecting...</span>
              </div>
            )}

            {/* Row 1: Product Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Traditional Temple Kasumala Gold Necklace"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Row 2: Material & Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                  Material *
                </label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all"
                >
                  <option value="gold">Gold (Yellow / Antique / Temple)</option>
                  <option value="silver">Silver (92.5 Sterling / Pure)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                  Audience / Section *
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all"
                >
                  <option value="women">Women Collection</option>
                  <option value="men">Men Collection</option>
                </select>
              </div>
            </div>

            {/* Row 3: Category & Purity (Carats) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {category === 'Other' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Type custom category name (e.g. Brooches, Toe Rings)..."
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                  {material === 'gold' ? 'Carats / Gold Purity *' : 'Silver Purity *'}
                </label>
                {material === 'gold' ? (
                  <select
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all"
                  >
                    <option value="22K">22K (916 BIS Hallmark)</option>
                    <option value="24K">24K (Pure Gold)</option>
                    <option value="18K">18K (Diamond / Designer)</option>
                  </select>
                ) : (
                  <select
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all"
                  >
                    <option value="92.5 Sterling">92.5% Sterling Silver</option>
                    <option value="99.9 Pure Silver">99.9% Pure Silver (Pooja Articles)</option>
                    <option value="Silver Articles">Traditional Silver</option>
                  </select>
                )}
              </div>
            </div>

            {/* Row 4: Weight & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                  Weight (in Grams) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    placeholder="e.g. 32.50"
                    required
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all placeholder:text-gray-400"
                  />
                  <span className="absolute right-3.5 top-3.5 text-xs font-semibold text-gray-400 pointer-events-none">
                    grams
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-sm font-semibold text-gray-400 pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 185000"
                    required
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter detailed jewellery description, craftsmanship, suitable occasions..."
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Row 6: Automatic Cloudinary Image Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                Product Image *
              </label>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors text-center">
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-md border border-gray-200 mb-3 bg-white">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-1.5 p-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Uploading to Cloudinary...</span>
                        </div>
                      )}
                    </div>

                    {uploadingImage ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading directly to Cloudinary...
                      </span>
                    ) : cloudinaryUrl ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded to Cloudinary
                        </span>
                        <label className="text-xs text-gray-500 hover:text-gray-900 underline cursor-pointer mt-1">
                          Select a different photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center py-4">
                    <div className="w-14 h-14 rounded-full bg-red-50 text-[#C8102E] flex items-center justify-center mb-3">
                      <ImagePlus className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      Click to choose jewellery photo
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Uploads automatically to Cloudinary
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Row 7: Featured Collection Toggle */}
            <div className="pt-2">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Featured Collection</span>
                  <span className="text-xs text-gray-500">Highlight this piece on the homepage showcase</span>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 text-[#8B0000] accent-[#8B0000] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-4">
              <Link
                href="/admin"
                className="px-5 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="px-7 py-3 bg-[#C8102E] hover:bg-[#A00D24] text-white text-sm font-semibold rounded-xl shadow-lg shadow-[#C8102E]/20 disabled:opacity-60 transition-all flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Publishing Product...
                  </>
                ) : (
                  <>
                    <span>Submit & Publish</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
