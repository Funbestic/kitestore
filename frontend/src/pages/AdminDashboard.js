import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  // Check admin authentication
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');
    
    if (!adminToken || !adminInfo) {
      navigate('/admin-login');
    } else {
      setAuthorized(true);
      loadOrders();
      loadProducts();
    }
  }, [navigate]);

  // Load orders from backend API
  const loadOrders = async () => {
    try {
      console.log('Fetching orders from backend...');
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();
      console.log('Orders found:', data.length);
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  // Load products from backend API
  const loadProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Update order status via backend API
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        loadOrders();
        alert('Order status updated!');
      } else {
        alert('Error updating order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order status');
    }
  };

  // Delete order via backend API
  const deleteOrder = async (orderId) => {
    if (window.confirm('Delete this order?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          loadOrders();
          alert('Order deleted!');
        } else {
          alert('Error deleting order');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order');
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalProducts = products.length;

  if (!authorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex gap-4">
          <button 
            onClick={loadOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            🔄 Refresh Orders
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminInfo');
              navigate('/admin-login');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">₦{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-purple-600">{totalProducts}</p>
            </div>
            <div className="text-4xl">🛍️</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-1 font-medium ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-1 font-medium ${
              activeTab === 'products'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🛍️ Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('add-product')}
            className={`pb-4 px-1 font-medium ${
              activeTab === 'add-product'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ➕ Add Product
          </button>
        </nav>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.customerInfo?.fullName || 'N/A'}<br />
                        <span className="text-xs">{order.customerInfo?.email}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                        ₦{order.total?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status || 'Pending'}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusBadge(order.status || 'Pending')}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description?.substring(0, 100)}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">₦{product.price?.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">Stock: {product.countInStock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Tab */}
      {activeTab === 'add-product' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Add New Product</h2>
          <form id="addProductForm" className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const product = {
              name: formData.get('name'),
              price: parseFloat(formData.get('price')),
              description: formData.get('description'),
              image: formData.get('image'),
              category: formData.get('category'),
              countInStock: parseInt(formData.get('countInStock'))
            };
            
            fetch('http://localhost:5000/api/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(product)
            })
            .then(res => res.json())
            .then(data => {
              alert('Product added successfully!');
              e.target.reset();
              loadProducts();
            })
            .catch(err => alert('Error adding product: ' + err.message));
          }}>
            <div>
              <label className="block text-gray-700 mb-1">Product Name</label>
              <input type="text" name="name" required className="w-full border rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Price (₦)</label>
              <input type="number" name="price" required className="w-full border rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Description</label>
              <textarea name="description" rows="3" required className="w-full border rounded-lg px-4 py-2"></textarea>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Image URL</label>
              <input type="url" name="image" required className="w-full border rounded-lg px-4 py-2" placeholder="https://images.unsplash.com/..." />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Category</label>
              <input type="text" name="category" required className="w-full border rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Stock Quantity</label>
              <input type="number" name="countInStock" required className="w-full border rounded-lg px-4 py-2" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Add Product
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;