

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    loadUserData();
    loadUserOrders();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      console.log('UserInfo:', userInfo);
      
      if (!userInfo || !userInfo.token) {
        navigate('/login');
        return;
      }
      
      const token = userInfo.token;
      
      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile data:', response.data);
      setUser(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
    } catch (error) {
      console.error('Error loading user data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    }
  };

  const loadUserOrders = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        setLoading(false);
        return;
      }
      
      const token = userInfo.token;
      
      const response = await axios.get('http://localhost:5000/api/users/my-orders', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Orders data:', response.data);
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo.token;
      
      const updateData = { name, email };
      if (password) updateData.password = password;
      
      const response = await axios.put('http://localhost:5000/api/users/profile', updateData, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const updatedUserInfo = { ...userInfo, ...response.data.user, token: response.data.token };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        
        setMessage('Profile updated successfully!');
        setEditing(false);
        setPassword('');
        setConfirmPassword('');
        
        setTimeout(() => setMessage(''), 3000);
        
        // Reload user data
        loadUserData();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Update failed');
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

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Section - Left Column */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">👤</div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400 mt-2">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-bold text-blue-600">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-bold text-green-600">₦{totalSpent.toLocaleString()}</span>
              </div>
            </div>
            
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditing(false);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="w-full mt-4 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            )}
            
            <button
              onClick={logout}
              className="w-full mt-3 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
        
        {/* Main Content - Right Column */}
        <div className="md:col-span-2">
          {/* Edit Profile Form */}
          {editing && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              
              {message && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded mb-4">
                  {message}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4">
                  {error}
                </div>
              )}
            
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">New Password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}
          
          {/* Order History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">My Orders</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500">You haven't placed any orders yet.</p>
                <a href="/" className="inline-block mt-4 text-blue-600 hover:text-blue-800">
                  Start Shopping →
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex flex-wrap justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-gray-500 ml-2">x {item.quantity}</span>
                            </div>
                            <span className="text-blue-600 font-semibold">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-3 mt-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">
                          Shipping to: {order.customerInfo?.address}, {order.customerInfo?.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-blue-600">₦{order.total?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;