// import { Link } from 'react-router-dom';
// import Header from '@/components/Header';
// import MiniHeader from '@/components/MiniHeader';
// import Footer from '@/components/Footer';
// import SEOHead from '@/components/SEOHead';
// import { useAppSelector } from "@/store/hooks";
// import { selectGlobalData } from "@/store/contentSlice";
// import { HEADER_OFFSET_PX } from "@/lib/layout";
// import { Card, CardContent } from '@/components/ui/card';
// import { Gem } from 'lucide-react';

// const Categories = () => {
//   const { categories, promoHeader } = useAppSelector(selectGlobalData);

//   const paddingTop = HEADER_OFFSET_PX;

//   const structuredData = {
//     '@context': 'https://schema.org',
//     '@type': 'CollectionPage',
//     '@id': 'https://www.flenixjewels.com/categories#collectionpage',
//     name: 'Jewelry Collections - Premium Diamond & Gold Jewelry | Flenix Jewels',
//     description: 'Explore our premium jewelry collections featuring GIA certified diamonds, gold, platinum rings, necklaces, earrings, and bracelets.',
//     url: 'https://www.flenixjewels.com/categories',
//     mainEntityOfPage: 'https://www.flenixjewels.com/categories',
//     mainEntity: {
//       '@type': 'ItemList',
//       '@id': 'https://www.flenixjewels.com/categories#itemlist',
//       itemListElement: categories.map((cat, index) => ({
//         '@type': 'ListItem',
//         position: index + 1,
//         item: {
//           '@type': 'Product',
//           '@id': `https://www.flenixjewels.com/category/${cat.id}#category`,
//           name: cat.name,
//           description: cat.description,
//           image: cat.image,
//           url: `https://www.flenixjewels.com/category/${cat.id}`
//         }
//       }))
//     }
//   };

//   const faqItems = [
//     {
//       question: "What jewelry categories do you offer?",
//       answer:
//         "We offer engagement rings, wedding bands, necklaces, earrings, bracelets, and custom diamond jewelry collections.",
//     },
//     {
//       question: "Are your diamonds certified?",
//       answer:
//         "Yes. We provide certified lab-grown and natural diamonds with trusted grading standards.",
//     },
//     {
//       question: "Can I request a custom design?",
//       answer:
//         "Yes. Our team can create custom designs, matching sets, and bespoke jewelry.",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       <SEOHead
//         title="Jewelry Collections - Diamond Rings, Gold Necklaces, Earrings & Bracelets | Flenix Jewels"
//         description="Explore our curated jewelry collections. Shop premium GIA certified diamond rings, 18K gold necklaces, elegant earrings, platinum bracelets. Best prices, free shipping worldwide."
//         keywords="jewelry collections, diamond rings collection, gold necklaces, diamond earrings, bracelets, engagement rings, wedding bands, solitaire rings, tennis bracelets, pearl necklaces, gemstone jewelry, ruby rings, emerald jewelry, sapphire earrings, custom jewelry"
//         canonicalUrl="https://www.flenixjewels.com/categories"
//         structuredData={structuredData}
//         breadcrumbs={[
//           { name: "Home", url: "https://www.flenixjewels.com" },
//           { name: "Categories", url: "https://www.flenixjewels.com/categories" },
//         ]}
//         faqItems={faqItems}
//       />

//       <Header promoHeader={promoHeader} />
//       {/* <MiniHeader categories={categories} promoHeight={promoHeight} /> */}

//       <main className="flex-1" style={{ paddingTop: `${paddingTop}px` }}>
//         {/* ── Hero ── */}
//         <section className="relative overflow-hidden py-20 md:py-28 bg-[#130900] dark:bg-[#0c0703]">
//           <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, #C4906A 35%, #D4A96A 50%, #C4906A 65%, transparent 95%)' }} />
//           <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 65% 70% at 50% 50%, rgba(196,144,106,0.11) 0%, transparent 70%)' }} />

//           <div className="relative z-10 container mx-auto px-4">
//             <div className="max-w-3xl mx-auto text-center">
//               <div className="flex items-center justify-center gap-3 mb-4">
//                 <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, #C4906A)' }} />
//                 <Gem className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />
//                 <span className="text-[10px] tracking-[0.35em] uppercase font-black" style={{ color: '#C4906A' }}>Collections</span>
//                 <Gem className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />
//                 <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, #C4906A, transparent)' }} />
//               </div>
//               <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.05] mb-5">Our Collections</h1>
//               <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
//                 Explore curated categories of premium jewelry — crafted for every occasion.
//               </p>
//             </div>
//           </div>
//         </section>

//         <section className="container mx-auto px-4 py-12">
//           {categories.length === 0 ? (
//             <div className="text-center py-20"><p className="text-lg text-muted-foreground">No categories available yet.</p></div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//               {categories.map((category) => (
//                 <Link key={category.id} to={`/category/${category.id}`} className="group">
//                   <Card className="overflow-hidden hover-lift h-full">
//                     <div className="aspect-[4/3] overflow-hidden bg-muted">
//                       <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" fetchpriority="low" />
//                     </div>
//                     <CardContent className="p-6">
//                       <h2 className="font-semibold text-2xl mb-2 group-hover:text-primary transition-colors">{category.name}</h2>
//                       <p className="text-muted-foreground">{category.description}</p>
//                     </CardContent>
//                   </Card>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </section>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default Categories;


import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { HEADER_OFFSET_PX } from "@/lib/layout";
import { Gem, ArrowRight } from 'lucide-react';

const Categories = () => {
  const { categories, promoHeader } = useAppSelector(selectGlobalData);
  const paddingTop = HEADER_OFFSET_PX;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.flenixjewels.com/categories#collectionpage',
    name: 'Jewelry Collections - Premium Diamond & Gold Jewelry | Flenix Jewels',
    description: 'Explore our premium jewelry collections featuring GIA certified diamonds, gold, platinum rings, necklaces, earrings, and bracelets.',
    url: 'https://www.flenixjewels.com/categories',
    mainEntityOfPage: 'https://www.flenixjewels.com/categories',
    mainEntity: {
      '@type': 'ItemList',
      '@id': 'https://www.flenixjewels.com/categories#itemlist',
      itemListElement: categories.map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          '@id': `https://www.flenixjewels.com/category/${cat.id}#category`,
          name: cat.name,
          description: cat.description,
          image: cat.image,
          url: `https://www.flenixjewels.com/category/${cat.id}`
        }
      }))
    }
  };

  const faqItems = [
    { question: "What jewelry categories do you offer?", answer: "We offer engagement rings, wedding bands, necklaces, earrings, bracelets, and custom diamond jewelry collections." },
    { question: "Are your diamonds certified?", answer: "Yes. We provide certified lab-grown and natural diamonds with trusted grading standards." },
    { question: "Can I request a custom design?", answer: "Yes. Our team can create custom designs, matching sets, and bespoke jewelry." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .cat-page { font-family: 'DM Sans', sans-serif; }
        .cat-serif { font-family: 'Cormorant Garamond', serif; }

        .cat-item {
          position: relative;
          display: block;
          text-decoration: none;
          overflow: hidden;
          border-radius: 12px;
          background: hsl(var(--muted));
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .cat-item:hover {
          box-shadow: 0 12px 40px rgba(196,144,106,0.15);
          transform: translateY(-2px);
        }

        .cat-img-wrap { overflow: hidden; }
        .cat-item img {
          width: 100%;
          aspect-ratio: 5/4;
          object-fit: cover;
          display: block;
          transition: transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .cat-item:hover img { transform: scale(1.06); }

        .cat-item-body {
          padding: 1.1rem 1.25rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .cat-arrow-btn {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 1.5px solid #C4906A;
          display: flex; align-items: center; justify-content: center;
          color: #C4906A;
          flex-shrink: 0;
          transition: background 0.22s, color 0.22s;
        }
        .cat-item:hover .cat-arrow-btn {
          background: #C4906A;
          color: #fff;
        }

        .cat-eyebrow {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #C4906A;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
      `}</style>

      <SEOHead
        title="Jewelry Collections - Diamond Rings, Gold Necklaces, Earrings & Bracelets | Flenix Jewels"
        description="Explore our curated jewelry collections. Shop premium GIA certified diamond rings, 18K gold necklaces, elegant earrings, platinum bracelets."
        keywords="jewelry collections, diamond rings, gold necklaces, diamond earrings, bracelets, engagement rings"
        canonicalUrl="https://www.flenixjewels.com/categories"
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "https://www.flenixjewels.com" },
          { name: "Categories", url: "https://www.flenixjewels.com/categories" },
        ]}
        faqItems={faqItems}
      />

      <Header promoHeader={promoHeader} />

      <main className="cat-page flex-1" style={{ paddingTop: `${paddingTop}px` }}>

        {/* Hero */}
        <section className="relative bg-[#130900] dark:bg-[#0c0703] py-14 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 55% 70% at 50% 100%, rgba(196,144,106,0.10) 0%, transparent 70%)' }} />
          <div className="relative text-center px-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-7" style={{ background: 'linear-gradient(90deg, transparent, #C4906A)' }} />
              <Gem className="h-2.5 w-2.5" style={{ color: '#C4906A' }} />
              <span className="text-[9px] tracking-[0.38em] uppercase font-semibold" style={{ color: '#C4906A' }}>Collections</span>
              <Gem className="h-2.5 w-2.5" style={{ color: '#C4906A' }} />
              <div className="h-px w-7" style={{ background: 'linear-gradient(90deg, #C4906A, transparent)' }} />
            </div>
            <h1 className="cat-serif text-4xl sm:text-5xl font-normal text-white tracking-tight">Our Collections</h1>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 300 }}>
              Crafted for every occasion, curated for you.
            </p>
          </div>
        </section>

        {/* Grid — full width, small padding only */}
        <section className="px-3 sm:px-5 py-6 sm:py-8">
          {categories.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-muted-foreground">No categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {categories.map((category, i) => (
                <Link key={category.id} to={`/category/${category.id}`} className="cat-item group">
                  <div className="cat-img-wrap">
                    <img
                      src={category.image}
                      alt={category.name}
                      loading={i < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </div>
                  <div className="cat-item-body">
                    <div className="min-w-0">
                      <p className="cat-eyebrow">Collection</p>
                      <h2 className="cat-serif text-xl sm:text-2xl font-medium leading-snug truncate text-foreground">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-xs mt-0.5 line-clamp-1 text-muted-foreground" style={{ fontWeight: 300 }}>
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="cat-arrow-btn">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Categories;

