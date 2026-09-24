import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import defaultHeroImg from "@/assets/hero.jpg";
import food1 from "@/assets/food-1.jpg";
import food2 from "@/assets/food-2.jpg";
import food3 from "@/assets/food-3.jpg";
import { useStore, resolveMenuImage, handleImageError } from "@/lib/store";

export function PromoCarousel() {
  const { promos, cms } = useStore((s) => ({
    promos: s.promos.filter((p) => p.active !== false),
    cms: s.cms,
  }));
  const [index, setIndex] = useState(0);

  const fallbackBanners = [defaultHeroImg, food2, food1, food3];

  const bannerList = (() => {
    const list: Array<{ id: string; imageUrl: string; link: string | null; alt: string }> = [];

    // If hero banner is enabled and has a custom image, make it the primary slide
    if (cms?.heroActive !== false && cms?.heroImage) {
      list.push({
        id: "hero-custom",
        imageUrl: resolveMenuImage(cms.heroImage, defaultHeroImg),
        link: null,
        alt: cms?.heroTitleLine1 || "Nanami Kitchen Hero Banner",
      });
    }

    // Add active promo slides
    promos.forEach((p, idx) => {
      list.push({
        id: p.id,
        imageUrl: p.imageUrl
          ? resolveMenuImage(p.imageUrl, defaultHeroImg)
          : fallbackBanners[idx % fallbackBanners.length],
        link: p.link || null,
        alt: p.title || `Nanami Kitchen promo banner ${idx + 1}`,
      });
    });

    // If no custom hero image and no promos, show default hero banner if hero is active
    if (list.length === 0 && cms?.heroActive !== false) {
      list.push({
        id: "hero-default",
        imageUrl: defaultHeroImg,
        link: null,
        alt: "Nanami Kitchen Signature Banner",
      });
    }

    return list;
  })();

  useEffect(() => {
    if (bannerList.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % bannerList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerList.length]);

  if (cms?.heroActive === false || bannerList.length === 0) return null;

  return (
    <section className="relative w-full">
      <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden rounded-b-2xl border-b border-border/60 shadow-xs bg-muted">
        {bannerList.map((banner, i) => {
          const isActive = i === index;
          const content = (
            <img
              src={banner.imageUrl}
              alt={banner.alt}
              width={1024}
              height={640}
              referrerPolicy="no-referrer"
              onError={(e) => handleImageError(e, defaultHeroImg)}
              className="h-full w-full object-cover transition-transform duration-700 ease-out"
            />
          );

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {banner.link ? (
                <Link to={banner.link} className="block h-full w-full">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}

        {/* Carousel indicators */}
        {bannerList.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-xs px-2.5 py-1">
              {bannerList.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
