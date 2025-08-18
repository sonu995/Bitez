import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Star, Clock, Plus, Minus, Filter, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Menu: React.FC = () => {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart, items: cartItems, updateQuantity } = useCart();
  
  // Get category from URL params or default to 'all'
  const categoryFromUrl = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVegOnly, setShowVegOnly] = useState(false);

  const restaurant = {
    id: '1',
    name: 'Healthy Mess Co.',
    cuisine: 'North Indian, South Indian',
    rating: 4.5,
    deliveryTime: '30-35 mins',
    image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=500',
    offer: '20% OFF'
  };

  const categories = [
    { id: 'all', name: 'All Items', count: 24 },
    { id: 'meal-plans', name: 'Meal Plans', count: 6 },
    { id: 'fast-food', name: 'Fast Food', count: 6 },
    { id: 'south-indian', name: 'South Indian', count: 5 },
    { id: 'north-indian', name: 'North Indian', count: 8 },
    { id: 'chinese', name: 'Chinese', count: 4 },
    { id: 'desserts', name: 'Desserts', count: 3 },
    { id: 'beverages', name: 'Beverages', count: 4 },
    { id: 'healthy', name: 'Healthy', count: 6 }
  ];

  const menuItems = [
    {
      id: '1',
      name: 'Dal Rice Combo',
      description: 'Yellow dal, steamed rice, pickle, and papad',
      price: 120,
      image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'main-course',
      isVeg: true,
      rating: 4.2,
      popular: true
    },
    {
      id: '2',
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice with tender chicken pieces',
      price: 180,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'north-indian',
      isVeg: false,
      rating: 4.6,
      popular: true
    },
    {
      id: '3',
      name: 'Weekly Meal Plan',
      description: '14 meals including lunch and dinner for a week',
      price: 1200,
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'meal-plans',
      isVeg: true,
      rating: 4.4,
      savings: 200
    },
    {
      id: '4',
      name: 'Veggie Burger',
      description: 'Crispy vegetable patty with fresh lettuce and tomato',
      price: 80,
      image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'fast-food',
      isVeg: true,
      rating: 4.0
    },
    {
      id: '5',
      name: 'Masala Chai',
      description: 'Traditional Indian spiced tea',
      price: 20,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'beverages',
      isVeg: true,
      rating: 4.3
    },
    {
      id: '6',
      name: 'Monthly Premium Plan',
      description: '60 meals with premium menu options',
      price: 4500,
      image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'meal-plans',
      isVeg: true,
      rating: 4.7,
      savings: 900,
      popular: true
    },
    {
      id: '7',
      name: 'Dosa with Sambar',
      description: 'Crispy South Indian crepe with lentil curry',
      price: 90,
      image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'south-indian',
      isVeg: true,
      rating: 4.3
    },
    {
      id: '8',
      name: 'Hakka Noodles',
      description: 'Stir-fried noodles with vegetables and sauces',
      price: 120,
      image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'chinese',
      isVeg: true,
      rating: 4.1
    },
    {
      id: '9',
      name: 'Gulab Jamun',
      description: 'Sweet milk dumplings in sugar syrup',
      price: 60,
      image: 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'desserts',
      isVeg: true,
      rating: 4.5
    },
    {
      id: '10',
      name: 'Quinoa Salad Bowl',
      description: 'Nutritious quinoa with fresh vegetables and dressing',
      price: 140,
      image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'healthy',
      isVeg: true,
      rating: 4.2
    }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !showVegOnly || item.isVeg;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  const getCartQuantity = (itemId: string) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurant: restaurant.name,
      isVeg: item.isVeg
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
              <p className="text-gray-600 mb-4">{restaurant.cuisine}</p>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{restaurant.rating}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg inline-block text-sm font-semibold">
                {restaurant.offer}
              </div>
            </div>
            <div className="relative">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Veg Toggle */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showVegOnly}
                    onChange={(e) => setShowVegOnly(e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm">Vegetarian Only</span>
                </label>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-semibold mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition duration-200 ${
                        activeCategory === category.id
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
              <p className="text-gray-600">{filteredItems.length} items found</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => {
                const quantity = getCartQuantity(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-200"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      {item.popular && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Popular
                          </span>
                        </div>
                      )}
                      <div className={`absolute top-4 right-4 w-6 h-6 rounded border-2 ${
                        item.isVeg 
                          ? 'border-green-500 bg-white' 
                          : 'border-red-500 bg-white'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                          item.isVeg ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
                          {item.savings && (
                            <span className="text-sm text-green-600 font-medium">
                              Save ₹{item.savings}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{item.rating}</span>
                        </div>
                      </div>

                      {quantity === 0 ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition duration-200"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Add to Cart
                        </button>
                      ) : (
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            onClick={() => updateQuantity(item.id, quantity - 1)}
                            className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold text-lg">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, quantity + 1)}
                            className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;