
const categories = [
  { name: 'Electronics', emoji: '🎧' },
  { name: 'Fashion', emoji: '👕' },
  { name: 'Home & Living', emoji: '🏠' },
  { name: 'Accessories', emoji: '⌚' },
]

function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-8">
        <p className="text-orange-500 font-semibold text-sm">
          EXPLORE COLLECTIONS
        </p>
        <h2 className="text-3xl font-bold mt-2">
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {categories.map((category) => (
          <div
            key={category.name}
            className="bg-gray-100 rounded-xl p-8 text-center hover:bg-orange-50 hover:-translate-y-1 transition cursor-pointer"
          >
            <div className="text-5xl mb-4">
              {category.emoji}
            </div>

            <h3 className="font-semibold text-gray-800">
              {category.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Categories
