
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import FeaturedProducts from '../components/FeaturedProducts'
import SEO from '../components/SEO'

function Home() {
  return (
    <>
      <SEO
        title="Shop Online – Electronics & More"
        description="Shop quality products and discover great prices across the ShopSphere collection."
        keywords={['online shopping', 'electronics', 'ShopSphere', 'quality products']}
        image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
      />
      <main>
      <Hero />
      <Categories />
      <FeaturedProducts />
      </main>
    </>
  )
}

export default Home
