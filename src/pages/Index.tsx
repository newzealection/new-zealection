import { motion } from 'framer-motion';
import { Hero } from '../components/Hero';

const Index = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Hero />
      
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-nzgreen-500 bg-stone-100 rounded-full">
              How It Works
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Collect, Trade, Experience
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Our unique gacha system lets you discover New Zealand's most beautiful locations through
              collectible cards. Each pull brings you closer to completing your collection and planning
              your perfect journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                title: "Pull a Card",
                description: "Use our gacha system to receive random location cards from our curated collection."
              },
              {
                title: "Build Your Collection",
                description: "Collect unique cards featuring New Zealand's most stunning destinations."
              },
              {
                title: "Plan Your Journey",
                description: "Use your collection to create the perfect itinerary for your New Zealand adventure."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="p-6 bg-white rounded-xl shadow-sm"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;