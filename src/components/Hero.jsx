
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

function Hero() {
  return (
    <section className="bg-orange-50">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">

        <div>
          <p className="text-orange-600 font-semibold uppercase tracking-widest text-sm">
            New Collection 2026
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mt-5 leading-tight text-gray-900">
            Discover Your
            <span className="text-orange-500"> Perfect </span>
            Style.
          </h1>

          <p className="text-gray-600 mt-6 text-lg leading-relaxed">
            Explore our exclusive collection of products.
            Quality, style and great prices — all in one place.
          </p>

          <Link
            to="/products"
            className="inline-flex items-center gap-3 mt-8 bg-black text-white px-8 py-4 rounded-lg hover:bg-orange-500 transition"
          >
            Shop Now
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80"
            srcSet="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80 600w, https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80 1000w"
            sizes="(min-width: 768px) 50vw, 100vw"
            alt="ShopSphere shopping collection"
            width="1000"
            height="600"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-[350px] md:h-[450px] object-cover"
          />
        </div>

      </div>
    </section>
  )
}

export default Hero
