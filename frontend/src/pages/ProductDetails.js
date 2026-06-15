import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import StarRating from '../components/StarRating';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [userName, setUserName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const fetchProduct = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews/product/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [id]);

  const fetchAverageRating = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews/product/${id}/average`);
      setAverageRating(response.data.averageRating);
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchAverageRating();
    
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserName(user.name || 'Guest User');
    } else {
      setUserName('Guest User');
    }
  }, [id, fetchProduct, fetchReviews, fetchAverageRating]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    
    if (userRating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    
    if (!userComment.trim()) {
      setReviewError('Please write a comment');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/reviews`, {
        productId: id,
        userName: userName,
        rating: userRating,
        comment: userComment
      });
      
      setReviewSubmitted(true);
      setUserRating(0);
      setUserComment('');
      fetchReviews();
      fetchAverageRating();
      
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch (error) {
      setReviewError('Failed to submit review. Please try again.');
    }
  };

  const addToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = existingCart.find(item => item.id === product._id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      existingCart.push({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      toast.error('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Product not found</p>
        <Link to="/" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {addedToCart && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          ✅ Added {quantity} x {product.name} to cart!
        </div>
      )}
      
      <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2">
        ← Back to Products
      </button>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="grid md:grid-cols-2 gap-8 p-6">
          <div className="relative">
            <img 
              src={product.image || 'https://via.placeholder.com/500x400?text=Product'} 
              alt={product.name}
              className="w-full h-96 object-contain rounded-lg"
            />
            {product.countInStock > 0 && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                In Stock
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={averageRating} readonly={true} size="md" />
              <span className="text-gray-500 text-sm">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">
                ₦{product.price?.toLocaleString()}
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
            
            <div className="mb-6 border-t border-b py-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Category:</span>
                <span className="font-semibold text-gray-800">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Availability:</span>
                <span className={`font-semibold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.countInStock > 0 ? `${product.countInStock} units available` : 'Out of Stock'}
                </span>
              </div>
            </div>
            
            {product.countInStock > 0 && (
              <div className="mb-6">
                <label className="block text-gray-600 mb-2">Quantity:</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors text-xl font-bold"
                  >
                    -
                  </button>
                  <span className="text-2xl font-semibold w-16 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                    className="w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors text-xl font-bold"
                  >
                    +
                  </button>
                  <span className="text-gray-500 text-sm ml-4">
                    Max: {product.countInStock}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={addToCart}
                disabled={product.countInStock === 0}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors text-lg ${
                  product.countInStock > 0 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {product.countInStock > 0 ? '🛒 Add to Cart' : '❌ Out of Stock'}
              </button>
              
              <button
                onClick={handleWishlistToggle}
                className={`px-6 py-3 rounded-lg font-semibold transition-all text-lg ${
                  isInWishlist(product._id)
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isInWishlist(product._id) ? '❤️ Saved' : '🤍 Save'}
              </button>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>✓ Free Shipping on orders over ₦50,000</p>
              <p className="mt-1">✓ 30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
        
        <div className="border-b pb-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          
          {reviewSubmitted && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-4">
              ✅ Thank you for your review!
            </div>
          )}
          
          {reviewError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4">
              ❌ {reviewError}
            </div>
          )}
          
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Rating</label>
              <StarRating rating={userRating} onRatingChange={setUserRating} size="lg" />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Review</label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your experience with this product..."
              />
            </div>
            
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Submit Review
            </button>
          </form>
        </div>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-800">{review.userName}</span>
                    <div className="mt-1">
                      <StarRating rating={review.rating} readonly={true} size="sm" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;