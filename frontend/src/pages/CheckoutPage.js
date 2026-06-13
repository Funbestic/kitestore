

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirm
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Shipping form state
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Payment form state
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'card'
  });

  // Load cart items
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      navigate('/cart');
    }
    setCartItems(cart);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total);
  }, [navigate]);

  // Handle shipping form input changes
  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  // Handle payment form input changes
  const handlePaymentChange = (e) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value
    });
  };

  // Validate shipping form
  const validateShipping = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state'];
    for (let field of required) {
      if (!shippingInfo[field]) {
        alert(`Please fill in ${field}`);
        return false;
      }
    }
    if (!shippingInfo.email.includes('@')) {
      alert('Please enter a valid email');
      return false;
    }
    if (shippingInfo.phone.length < 10) {
      alert('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  // Validate payment form
  const validatePayment = () => {
    if (paymentInfo.paymentMethod === 'card') {
      if (!paymentInfo.cardNumber || paymentInfo.cardNumber.replace(/\s/g, '').length < 16) {
        alert('Please enter a valid card number');
        return false;
      }
      if (!paymentInfo.cardName) {
        alert('Please enter cardholder name');
        return false;
      }
      if (!paymentInfo.expiryDate) {
        alert('Please enter expiry date');
        return false;
      }
      if (!paymentInfo.cvv || paymentInfo.cvv.length < 3) {
        alert('Please enter valid CVV');
        return false;
      }
    }
    return true;
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setPaymentInfo({
      ...paymentInfo,
      cardNumber: formatted
    });
  };

  // Format expiry date (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\//g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setPaymentInfo({
      ...paymentInfo,
      expiryDate: value
    });
  };

  // Proceed to next step
  const nextStep = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
    } else if (step === 2 && validatePayment()) {
      setStep(3);
    }
  };

  // Previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  // Place order
const placeOrder = async () => {
  // Generate random order number
  const orderNum = 'KITE-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  
  // Prepare order data for backend
  const orderData = {
    orderNumber: orderNum,
    customerInfo: {
      fullName: shippingInfo.fullName,
      email: shippingInfo.email,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zipCode: shippingInfo.zipCode
    },
    items: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    paymentMethod: paymentInfo.paymentMethod,
    total: totalPrice,
    status: 'Pending'
  };
  
  try {
    // Send to backend API
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    if (response.ok) {
      const savedOrder = await response.json();
      console.log('Order saved to database:', savedOrder);
      
      setOrderNumber(orderNum);
      
      // Clear cart from localStorage
      localStorage.setItem('cart', '[]');
      window.dispatchEvent(new Event('cartUpdated'));
      
      setOrderPlaced(true);
    } else {
      const error = await response.json();
      alert('Error placing order: ' + error.message);
    }
  } catch (error) {
    console.error('Error placing order:', error);
    alert('Error placing order. Please try again.');
  }
};

  // If order placed successfully, show confirmation
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-lg">Thank you for your purchase!</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Order Details</h3>
            <p className="text-gray-600 mb-2"><strong>Order Number:</strong> {orderNumber}</p>
            <p className="text-gray-600 mb-2"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p className="text-gray-600 mb-4"><strong>Total:</strong> ₦{totalPrice.toLocaleString()}</p>
            
            <h4 className="font-semibold mb-2">Shipping to:</h4>
            <p className="text-gray-600 mb-4">
              {shippingInfo.fullName}<br />
              {shippingInfo.address}<br />
              {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
              Phone: {shippingInfo.phone}
            </p>
            
            <Link 
              to="/orders"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-4"
            >
              View My Orders
            </Link>
            <Link 
              to="/"
              className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
      
      {/* Progress Steps */}
      <div className="flex justify-between mb-8 max-w-2xl mx-auto">
        <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            1
          </div>
          <span className="text-sm">Shipping</span>
        </div>
        <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            2
          </div>
          <span className="text-sm">Payment</span>
        </div>
        <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            3
          </div>
          <span className="text-sm">Confirm</span>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form - Left Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="08012345678"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Lagos"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Lagos"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Zip Code (Optional)</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="100001"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={paymentInfo.paymentMethod}
                      onChange={handlePaymentChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="card">Credit / Debit Card</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="cash">Cash on Delivery</option>
                    </select>
                  </div>
                  
                  {paymentInfo.paymentMethod === 'card' && (
                    <>
                      <div>
                        <label className="block text-gray-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={paymentInfo.cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          name="cardName"
                          value={paymentInfo.cardName}
                          onChange={handlePaymentChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="JOHN DOE"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={paymentInfo.expiryDate}
                            onChange={handleExpiryChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">CVV</label>
                          <input
                            type="password"
                            name="cvv"
                            value={paymentInfo.cvv}
                            onChange={handlePaymentChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="123"
                            maxLength="4"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {paymentInfo.paymentMethod === 'bank' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-semibold mb-2">Bank Transfer Details:</p>
                      <p className="text-sm">Bank: KiteStore Bank</p>
                      <p className="text-sm">Account Name: KiteStore Enterprises</p>
                      <p className="text-sm">Account Number: 0123456789</p>
                      <p className="text-sm text-gray-600 mt-2">Please use your order number as reference</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 3: Order Confirmation */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Confirm Your Order</h2>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">Shipping Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Name:</strong> {shippingInfo.fullName}</p>
                    <p><strong>Email:</strong> {shippingInfo.email}</p>
                    <p><strong>Phone:</strong> {shippingInfo.phone}</p>
                    <p><strong>Address:</strong> {shippingInfo.address}</p>
                    <p><strong>City:</strong> {shippingInfo.city}, {shippingInfo.state}</p>
                    {shippingInfo.zipCode && <p><strong>Zip Code:</strong> {shippingInfo.zipCode}</p>}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">Payment Method</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Method:</strong> {paymentInfo.paymentMethod === 'card' ? 'Credit/Debit Card' : paymentInfo.paymentMethod === 'bank' ? 'Bank Transfer' : 'Cash on Delivery'}</p>
                    {paymentInfo.paymentMethod === 'card' && (
                      <>
                        <p><strong>Card Number:</strong> **** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                        <p><strong>Cardholder:</strong> {paymentInfo.cardName}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors ml-auto"
                >
                  Place Order
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Order Summary - Right Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="max-h-64 overflow-y-auto mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between mb-3 pb-3 border-b">
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mb-4 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">₦{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;