import { Link } from 'react-router-dom';

const Hero = () => {
  // Function to scroll smoothly to products section
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 rounded-xl mb-8">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-bounce">
          Summer Sale!
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          Up to 30% off on selected items
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={scrollToProducts}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
          >
            Shop Now →
          </button>
          <Link 
            to="/"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
          >
            View All
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;