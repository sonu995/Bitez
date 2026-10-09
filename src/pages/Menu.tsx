import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Plus,
  Minus,
  Search,
  Sparkles,
  Flame,
  CheckCircle2,
  Tag,
  SlidersHorizontal,
  Leaf,
  X,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Award,
  Zap,
  Info,
  Check,
  Percent,
  RotateCcw,
  ChefHat,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';

// Dish interface definition
interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  isVeg: boolean;
  rating: number;
  reviews: number;
  tag?: string;
  prepTime: string;
  calories: number;
  protein: string;
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  serves: string;
  ingredients: string[];
}

const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, items: cartItems, updateQuantity, totalAmount, totalItems } = useCart();

  // Filters & State
  const categoryFromUrl = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<string>(categoryFromUrl || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_low' | 'price_high' | 'quick'>('popular');
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  // Sync category param with URL if present (with alias normalization)
  useEffect(() => {
    if (categoryFromUrl) {
      const aliasMap: Record<string, string> = {
        'south_indian': 'south-indian',
        'chowmein': 'chinese',
        'combos': 'thali',
        'fries': 'momos',
        'mess': 'thali',
        'healthy_bowls': 'healthy'
      };
      setActiveCategory(aliasMap[categoryFromUrl] || categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Handle promo code copy
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Code "${code}" copied to clipboard! 🎉`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Restaurant details
  const restaurant = {
    id: 'bitez-express',
    name: 'Bitez Express Kitchen',
    subtitle: 'Authentic Homestyle Meals, Daily Tiffins & Handcrafted Street Bites',
    cuisines: 'North Indian • Home-Style Thalis • Biryanis • Snacks • Healthy Bowls',
    rating: 4.8,
    reviewsCount: '1,840+',
    deliveryTime: '20–30 mins',
    fssai: 'FSSAI Lic. 1042300000000',
    location: 'Sector 4, City Centre, Bokaro',
    bannerImg: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200'
  };

  // Categories list matching user design with 3D food illustration assets
  const categories = [
    { id: 'all', name: 'All Dishes', icon: '✨', image: '/categories/all.png' },
    { id: 'thali', name: 'Thalis & Combos', icon: '🍱', image: '/categories/thali.png' },
    { id: 'biryani', name: 'Biryani & Rice', icon: '🥘', image: '/categories/biryani.png' },
    { id: 'curries', name: 'Curries & Breads', icon: '🍲', image: '/categories/curries.png' },
    { id: 'burgers', name: 'Burgers', icon: '🍔', image: '/categories/burgers.png' },
    { id: 'rolls', name: 'Kathi Rolls', icon: '🌯', image: '/categories/rolls.png' },
    { id: 'momos', name: 'Momos & Dimsums', icon: '🥟', image: '/categories/momos.png' },
    { id: 'fries', name: 'Fries & Sides', icon: '🍟', image: '/categories/fries.png' },
    { id: 'chinese', name: 'Chinese & Chowmein', icon: '🍜', image: '/categories/chinese.png' },
    { id: 'south-indian', name: 'South Indian', icon: '🫔', image: '/categories/south-indian.png' },
    { id: 'healthy', name: 'Fitness & Healthy', icon: '🥗', image: '/categories/healthy.png' },
    { id: 'desserts', name: 'Desserts & Sweets', icon: '🍨', image: '/categories/desserts.png' },
    { id: 'beverages', name: 'Shakes & Coolers', icon: '🥤', image: '/categories/beverages.png' },
    { id: 'pizza', name: 'Pizza & Bakes', icon: '🍕', image: '/categories/pizza.png' }
  ];

  // Comprehensive Menu Items dataset
  const menuItems: MenuItem[] = [
    {
      id: 'm1',
      name: 'Special Shahi Paneer Thali',
      category: 'thali',
      description: 'Velvety Shahi Paneer, Dal Makhani, Jeera Rice, 4 Butter Tawa Rotis, Fresh Salad, Mint Chutney & Gulab Jamun.',
      price: 160,
      originalPrice: 200,
      image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.8,
      reviews: 580,
      tag: 'Bestseller 🔥',
      prepTime: '20-25 mins',
      calories: 680,
      protein: '24g',
      spiceLevel: 'Mild',
      serves: '1-2 Persons',
      ingredients: ['Fresh Paneer', 'Desi Ghee', 'Basmati Rice', 'Butter Roti', 'Dal Makhani', 'Gulab Jamun']
    },
    {
      id: 'm2',
      name: 'Hyderabadi Dum Chicken Biryani',
      category: 'biryani',
      description: 'Slow-cooked aromatic basmati rice with succulent chicken marinated in royal spices, accompanied by Mirchi Ka Salan and creamy Raita.',
      price: 199,
      originalPrice: 249,
      image: 'https://images.pexels.com/photos/7394819/pexels-photo-7394819.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: false,
      rating: 4.9,
      reviews: 820,
      tag: 'Chef Special 👑',
      prepTime: '20-25 mins',
      calories: 720,
      protein: '36g',
      spiceLevel: 'Spicy',
      serves: '1 Person',
      ingredients: ['Tender Chicken', 'Long-grain Basmati Rice', 'Saffron', 'Brown Onions', 'Mint', 'Kewra Water']
    },
    {
      id: 'm3',
      name: 'Homestyle Veg Thali',
      category: 'thali',
      description: 'Simple and comforting home meal: Yellow Dal Tadka, Aloo Gobhi Matar, Steamed Rice, 4 Phulkas, Pickle & Crunchy Papad.',
      price: 110,
      originalPrice: 140,
      image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.7,
      reviews: 490,
      tag: 'Homestyle ❤️',
      prepTime: '15-20 mins',
      calories: 520,
      protein: '16g',
      spiceLevel: 'Mild',
      serves: '1 Person',
      ingredients: ['Yellow Dal', 'Seasonal Veggies', 'Steamed Rice', 'Soft Phulkas', 'Papad', 'Homemade Pickle']
    },
    {
      id: 'm4',
      name: 'Butter Chicken with 2 Butter Naan',
      category: 'curries',
      description: 'Tender roasted chicken tikka submerged in a silky, buttery tomato-cashew gravy served hot with 2 soft tandoori butter naans.',
      price: 220,
      originalPrice: 280,
      image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: false,
      rating: 4.8,
      reviews: 640,
      tag: 'Top Rated ⭐',
      prepTime: '20-25 mins',
      calories: 780,
      protein: '38g',
      spiceLevel: 'Medium',
      serves: '1-2 Persons',
      ingredients: ['Boneless Chicken', 'Cashew Paste', 'Fresh Cream', 'Amul Butter', 'Kasuri Methi', 'Tandoori Naan']
    },
    {
      id: 'm5',
      name: 'Dal Makhani & Jeera Rice Bowl',
      category: 'curries',
      description: 'Slow-simmered black lentils cooked overnight with cream and butter, paired with fragrant cumin basmati rice and onion rings.',
      price: 130,
      originalPrice: 160,
      image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.6,
      reviews: 320,
      tag: 'Comfort Food 🍲',
      prepTime: '15-20 mins',
      calories: 560,
      protein: '19g',
      spiceLevel: 'Mild',
      serves: '1 Person',
      ingredients: ['Urad Dal', 'Rajma', 'Makhan Butter', 'Cumin Rice', 'Garlic Tadka']
    },
    {
      id: 'm6',
      name: 'Paneer Butter Masala (500ml)',
      category: 'curries',
      description: 'Diced cottage cheese simmered in a luscious makhani gravy enriched with butter, honey and aromatic whole spices.',
      price: 150,
      originalPrice: 190,
      image: 'https://images.pexels.com/photos/9738981/pexels-photo-9738981.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.7,
      reviews: 410,
      tag: 'Must Try 🧀',
      prepTime: '15-20 mins',
      calories: 490,
      protein: '22g',
      spiceLevel: 'Medium',
      serves: '2 Persons',
      ingredients: ['Malai Paneer', 'Fresh Cream', 'Tomato Purée', 'Whole Spices', 'Coriander Garnish']
    },
    {
      id: 'm7',
      name: 'Double Patty Crispy Chicken Burger',
      category: 'burgers',
      description: 'Two golden fried crispy chicken patties, melted cheese slice, crisp iceberg lettuce and smoky chipotle mayo in toasted brioche buns.',
      price: 140,
      originalPrice: 175,
      image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: false,
      rating: 4.6,
      reviews: 340,
      tag: 'Bestseller 🔥',
      prepTime: '15-20 mins',
      calories: 610,
      protein: '28g',
      spiceLevel: 'Medium',
      serves: '1 Person',
      ingredients: ['Crispy Chicken Fillet', 'Cheese Slice', 'Smoky Chipotle Mayo', 'Brioche Bun', 'Jalapeños']
    },
    {
      id: 'm8',
      name: 'Crispy Veggie Crunch Burger',
      category: 'burgers',
      description: 'Herb-crusted golden vegetable patty loaded with fresh cucumber, ripe tomatoes, sliced onions and secret tangy burger sauce.',
      price: 85,
      originalPrice: 110,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.3,
      reviews: 210,
      tag: 'Under ₹99 ⚡',
      prepTime: '10-15 mins',
      calories: 420,
      protein: '11g',
      spiceLevel: 'Mild',
      serves: '1 Person',
      ingredients: ['Aloo Corn Patty', 'Iceberg Lettuce', 'Signature Sauce', 'Sesame Bun']
    },
    {
      id: 'm9',
      name: 'Paneer Tikka Kathi Roll',
      category: 'rolls',
      description: 'Char-grilled cottage cheese cubes tossed in spicy tandoori masala, wrapped in a flaky paratha with mint mayonnaise and crunchy onions.',
      price: 90,
      originalPrice: 115,
      image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.5,
      reviews: 290,
      tag: 'Popular 🌯',
      prepTime: '12-15 mins',
      calories: 460,
      protein: '17g',
      spiceLevel: 'Medium',
      serves: '1 Person',
      ingredients: ['Paneer Tikka', 'Flaky Paratha', 'Mint Chutney', 'Lachha Onion', 'Chaat Masala']
    },
    {
      id: 'm10',
      name: 'Double Egg Chicken Kathi Roll',
      category: 'rolls',
      description: 'Warm laccha paratha layered with double eggs, filled with tender shredded roasted chicken, capsicum and zesty green chutney.',
      price: 110,
      originalPrice: 140,
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: false,
      rating: 4.7,
      reviews: 430,
      tag: 'High Protein 💪',
      prepTime: '15-20 mins',
      calories: 540,
      protein: '31g',
      spiceLevel: 'Spicy',
      serves: '1 Person',
      ingredients: ['Double Eggs', 'Spiced Chicken', 'Crispy Laccha Paratha', 'Chutney', 'Lemon Spritz']
    },
    {
      id: 'm11',
      name: 'Kurkure Paneer Steamed Momos (8 Pcs)',
      category: 'momos',
      description: 'Delicate dumplings stuffed with seasoned paneer & scallions, served with spicy red schezwan dip and garlic mayo.',
      price: 90,
      originalPrice: 120,
      image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.6,
      reviews: 380,
      tag: 'Street Favourite 🥟',
      prepTime: '12-15 mins',
      calories: 340,
      protein: '14g',
      spiceLevel: 'Spicy',
      serves: '1 Person',
      ingredients: ['Paneer filling', 'Scallions', 'Ginger garlic', 'Schezwan Dip', 'Creamy Mayo']
    },
    {
      id: 'm12',
      name: 'Spicy Chicken Fried Momos (8 Pcs)',
      category: 'momos',
      description: 'Crispy golden fried momos filled with minced chicken and black pepper, dusted with peri-peri seasoning.',
      price: 110,
      originalPrice: 140,
      image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: false,
      rating: 4.7,
      reviews: 510,
      tag: 'Hot & Crispy 🌶️',
      prepTime: '15-18 mins',
      calories: 450,
      protein: '22g',
      spiceLevel: 'Spicy',
      serves: '1 Person',
      ingredients: ['Minced Chicken', 'Crispy Coating', 'Peri Peri Dust', 'Fiery Dip']
    },
    {
      id: 'm13',
      name: 'Desi Street Style Veg Chowmein',
      category: 'chinese',
      description: 'Wok-tossed noodles with shredded cabbage, carrots, bell peppers, dark soy sauce, chilli vinegar and fragrant spring onions.',
      price: 80,
      originalPrice: 100,
      image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.4,
      reviews: 260,
      tag: 'Under ₹99 ⚡',
      prepTime: '12-15 mins',
      calories: 390,
      protein: '9g',
      spiceLevel: 'Medium',
      serves: '1 Person',
      ingredients: ['Hakka Noodles', 'Crisp Veggies', 'Dark Soya Sauce', 'Chilli Vinegar', 'Garlic']
    },
    {
      id: 'm14',
      name: 'Chilli Chicken Gravy with Fried Rice Combo',
      category: 'chinese',
      description: 'Crispy chicken chunks tossed with capsicum, onion and soya chilli sauce, accompanied by wok-tossed egg fried rice.',
      price: 180,
      originalPrice: 220,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: false,
      rating: 4.7,
      reviews: 390,
      tag: 'Combo Deal 🍱',
      prepTime: '18-22 mins',
      calories: 670,
      protein: '33g',
      spiceLevel: 'Spicy',
      serves: '1 Person',
      ingredients: ['Chicken Breast', 'Egg Fried Rice', 'Green Peppers', 'Soya Chilli Sauce']
    },
    {
      id: 'm15',
      name: 'Crispy Butter Masala Dosa',
      category: 'south-indian',
      description: 'Golden fermented rice crepe smeared with Amul butter and spiced potato masala, served with piping hot Sambar and 2 fresh chutneys.',
      price: 95,
      originalPrice: 120,
      image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.6,
      reviews: 440,
      tag: 'South Classic 🫔',
      prepTime: '15-20 mins',
      calories: 410,
      protein: '11g',
      spiceLevel: 'Medium',
      serves: '1 Person',
      ingredients: ['Dosa Batter', 'Spiced Aloo Masala', 'Butter', 'Toor Dal Sambar', 'Coconut Chutney']
    },
    {
      id: 'm16',
      name: 'Steamed Idli Sambar (4 Pcs)',
      category: 'south-indian',
      description: 'Fluffy, cloud-soft steamed rice cakes served submerged in rich vegetable sambar with fresh coconut and tomato chutney.',
      price: 70,
      originalPrice: 90,
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.5,
      reviews: 230,
      tag: 'Under ₹99 ⚡',
      prepTime: '10-12 mins',
      calories: 280,
      protein: '9g',
      spiceLevel: 'Mild',
      serves: '1 Person',
      ingredients: ['Urad Dal', 'Steamed Rice', 'Lentil Sambar', 'Fresh Coconut Chutney']
    },
    {
      id: 'm17',
      name: 'High-Protein Paneer Sprouts Salad Bowl',
      category: 'healthy',
      description: 'Grilled low-fat paneer cubes, sprouted moong, boiled chickpeas, cucumber, cherry tomatoes and tangy lemon-herb olive dressing.',
      price: 130,
      originalPrice: 160,
      image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.8,
      reviews: 310,
      tag: 'Fitness Choice 🥗',
      prepTime: '10-12 mins',
      calories: 320,
      protein: '26g',
      spiceLevel: 'Mild',
      serves: '1 Person',
      ingredients: ['Low-Fat Paneer', 'Moong Sprouts', 'Chickpeas', 'Olive Oil Dressing', 'Flax Seeds']
    },
    {
      id: 'm18',
      name: 'Grilled Herb Chicken Protein Bowl',
      category: 'healthy',
      description: 'Juicy herb-marinated grilled chicken breast, steamed brown rice, sautéed broccoli, bell peppers and garlic yoghurt sauce.',
      price: 190,
      originalPrice: 230,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: false,
      rating: 4.9,
      reviews: 270,
      tag: 'Gym Pro 💪',
      prepTime: '15-20 mins',
      calories: 440,
      protein: '42g',
      spiceLevel: 'Mild',
      serves: '1 Person',
      ingredients: ['Chicken Breast', 'Broccoli', 'Brown Rice', 'Greek Yoghurt Dip', 'Herbs']
    },
    {
      id: 'm19',
      name: 'Warm Gulab Jamun in Sugar Syrup (2 Pcs)',
      category: 'desserts',
      description: 'Melt-in-mouth traditional khoya dumplings fried golden brown and soaked in aromatic cardamom and saffron sugar syrup.',
      price: 50,
      originalPrice: 70,
      image: 'https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.9,
      reviews: 670,
      tag: 'Sweet Delight 🍨',
      prepTime: '5-8 mins',
      calories: 290,
      protein: '6g',
      spiceLevel: 'Mild',
      serves: '1 Person',
      ingredients: ['Pure Khoya', 'Elaichi', 'Kesar Syrup', 'Rose Water', 'Pistachio Garnish']
    },
    {
      id: 'm20',
      name: 'Kolkata Rasgulla (2 Pcs)',
      category: 'desserts',
      description: 'Spongy and juicy cottage cheese spheres simmered in light sugar syrup, served chilled or warm.',
      price: 50,
      originalPrice: 65,
      image: 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.6,
      reviews: 180,
      tag: 'Under ₹99 ⚡',
      prepTime: '5 mins',
      calories: 220,
      protein: '7g',
      spiceLevel: 'Mild',
      serves: '1 Person',
      ingredients: ['Fresh Chhena', 'Light Sugar Syrup', 'Cardamom']
    },
    {
      id: 'm21',
      name: 'Thick Alphonso Mango Shake (350ml)',
      category: 'beverages',
      description: 'Creamy blend of real Alphonso mango pulp, chilled rich milk and a scoop of vanilla ice cream, topped with almond slivers.',
      price: 70,
      originalPrice: 90,
      image: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.8,
      reviews: 350,
      tag: 'Best Chiller 🥭',
      prepTime: '5-8 mins',
      calories: 280,
      protein: '6g',
      spiceLevel: 'Mild',
      serves: '1 Person',
      ingredients: ['Alphonso Mango Pulp', 'Full Cream Milk', 'Vanilla Ice Cream', 'Almonds']
    },
    {
      id: 'm22',
      name: 'Traditional Masala Chai Flask (500ml)',
      category: 'beverages',
      description: 'Authentic Indian spiced tea brewed with fresh ginger, green cardamom, cloves and crushed tulsi leaves. Serves 3 cups.',
      price: 60,
      originalPrice: 80,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.7,
      reviews: 480,
      tag: 'Desi Chai ☕',
      prepTime: '8-10 mins',
      calories: 140,
      protein: '4g',
      spiceLevel: 'Mild',
      serves: '2-3 Persons',
      ingredients: ['Assam Tea Leaves', 'Fresh Adrak', 'Green Cardamom', 'Farm Fresh Milk']
    },
    {
      id: 'm23',
      name: 'Punjabi Sweet Lassi with Malai (350ml)',
      category: 'beverages',
      description: 'Thick, churned yogurt sweetened with rose essence and topped with a thick dollop of fresh clotted cream and crushed pistachios.',
      price: 55,
      originalPrice: 75,
      image: 'https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.7,
      reviews: 310,
      tag: 'Refreshing 🥛',
      prepTime: '5 mins',
      calories: 250,
      protein: '7g',
      spiceLevel: 'Mild',
      serves: '1 Person',
      ingredients: ['Fresh Dahi', 'Kewra Essence', 'Thick Malai', 'Pistachios']
    },
    {
      id: 'm24',
      name: 'Peri Peri Masala French Fries',
      category: 'fries',
      description: 'Crisp salted golden potato fries tossed heavily in spicy tangy African peri-peri spice dust. Served with garlic dip.',
      price: 65,
      originalPrice: 85,
      image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.4,
      reviews: 290,
      tag: 'Snack Attack 🍟',
      prepTime: '10-12 mins',
      calories: 330,
      protein: '4g',
      spiceLevel: 'Spicy',
      serves: '1-2 Persons',
      ingredients: ['Idaho Potatoes', 'Peri Peri Seasoning', 'Garlic Mayo Dip']
    },
    {
      id: 'm27',
      name: 'Cheesy Loaded Golden Fries',
      category: 'fries',
      description: 'Crisp hot french fries smothered in creamy melted cheddar cheese sauce, jalapeños and herb seasoning.',
      price: 95,
      originalPrice: 125,
      image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.7,
      reviews: 380,
      tag: 'Cheesy Treat 🧀',
      prepTime: '10-15 mins',
      calories: 410,
      protein: '7g',
      spiceLevel: 'Mild',
      serves: '1-2 Persons',
      ingredients: ['Potatoes', 'Cheddar Cheese Sauce', 'Pickled Jalapeños', 'Paprika']
    },
    {
      id: 'm25',
      name: 'Farmhouse Veggie Supreme Pizza (8")',
      category: 'pizza',
      description: 'Hand-stretched crust loaded with paneer cubes, crisp capsicum, sweet corn, black olives and melted 100% mozzarella.',
      price: 169,
      originalPrice: 219,
      image: 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: true,
      rating: 4.8,
      reviews: 410,
      tag: 'Chef Special 🍕',
      prepTime: '15-20 mins',
      calories: 620,
      protein: '22g',
      spiceLevel: 'Medium',
      serves: '1-2 Persons',
      ingredients: ['Fresh Mozzarella', 'Diced Paneer', 'Crisp Bell Pepper', 'Sweet Corn', 'Black Olives', 'Italian Herbs']
    },
    {
      id: 'm26',
      name: 'Smoky Tandoori Chicken Pizza (8")',
      category: 'pizza',
      description: 'Loaded with succulent smoky tandoori chicken tikka, red onion rings, green chillies and melted double mozzarella.',
      price: 199,
      originalPrice: 249,
      image: 'https://images.pexels.com/photos/2619967/pexels-photo-2619967.jpeg?auto=compress&cs=tinysrgb&w=600',
      isVeg: false,
      rating: 4.9,
      reviews: 530,
      tag: 'Bestseller 🔥',
      prepTime: '18-20 mins',
      calories: 710,
      protein: '34g',
      spiceLevel: 'Spicy',
      serves: '1-2 Persons',
      ingredients: ['Tandoori Chicken Tikka', 'Double Mozzarella', 'Red Onion', 'Green Chillies', 'Marinara Sauce']
    }
  ];

  // Quick filter definitions
  const quickFilters = [
    { id: 'all', label: 'All Items' },
    { id: 'bestseller', label: '🔥 Bestsellers' },
    { id: 'under99', label: '⚡ Under ₹99' },
    { id: 'rating45', label: '⭐ 4.5+ Rating' },
    { id: 'protein', label: '💪 High Protein' },
    { id: 'spicy', label: '🌶️ Spicy Treats' }
  ];

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        // Category check
        const matchesCategory =
          activeCategory === 'all' ||
          item.category === activeCategory ||
          (activeCategory === 'fries' && item.category === 'momos') ||
          (activeCategory === 'momos' && item.category === 'fries');

        // Search check
        const matchesSearch =
          searchQuery.trim() === '' ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));

        // Dietary check
        const matchesDietary =
          dietaryFilter === 'all' ||
          (dietaryFilter === 'veg' && item.isVeg) ||
          (dietaryFilter === 'nonveg' && !item.isVeg);

        // Quick filter pills check
        let matchesQuick = true;
        if (selectedQuickFilter === 'bestseller') {
          matchesQuick = Boolean(item.tag?.toLowerCase().includes('bestseller') || item.rating >= 4.8);
        } else if (selectedQuickFilter === 'under99') {
          matchesQuick = item.price <= 99;
        } else if (selectedQuickFilter === 'rating45') {
          matchesQuick = item.rating >= 4.5;
        } else if (selectedQuickFilter === 'protein') {
          matchesQuick = parseInt(item.protein) >= 20;
        } else if (selectedQuickFilter === 'spicy') {
          matchesQuick = item.spiceLevel === 'Spicy';
        }

        return matchesCategory && matchesSearch && matchesDietary && matchesQuick;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'quick') {
          const timeA = parseInt(a.prepTime);
          const timeB = parseInt(b.prepTime);
          return timeA - timeB;
        }
        // default popular
        return b.reviews - a.reviews;
      });
  }, [activeCategory, searchQuery, dietaryFilter, selectedQuickFilter, sortBy]);

  // Helper for item quantity in cart
  const getItemQuantity = (id: string) => {
    const found = cartItems.find((i) => i.id === id);
    return found ? found.quantity : 0;
  };

  // Add to cart with visual feedback
  const handleAdd = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurant: restaurant.name,
      isVeg: item.isVeg
    });
    showToast(`Added ${item.name} to cart! 😋`);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setDietaryFilter('all');
    setSelectedQuickFilter('all');
    setSortBy('popular');
  };

  // Free delivery calculation
  const freeDeliveryThreshold = 200;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - totalAmount);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-sm font-semibold border border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Notice / Ticker */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 text-white py-2 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide shadow-xs flex items-center justify-center gap-2 flex-wrap">
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
          🔥 Super Saver
        </span>
        <span>
          Use code <strong className="underline underline-offset-2">SAVE20</strong> for 20% OFF | Free Instant Delivery above ₹200!
        </span>
      </div>

      {/* Restaurant Hero Atmosphere Card - Warm Amber & Spiced Orange Gourmet Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-amber-950 to-orange-950 text-white shadow-2xl shadow-amber-950/25 border border-amber-500/30">
          {/* Background image with gradient blend */}
          <div className="absolute inset-0">
            <img
              src={restaurant.bannerImg}
              alt="Restaurant Cuisine"
              className="w-full h-full object-cover opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-950/95 via-stone-950/80 to-orange-950/90" />
          </div>

          {/* Warm Ambient Radial Glow Orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-4 sm:p-10 z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
              
              {/* Left Details */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-200 border border-amber-400/40 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold mb-2.5 sm:mb-3.5 backdrop-blur-md shadow-xs">
                  <ChefHat className="w-3.5 h-3.5 text-amber-300" />
                  <span>Master Chef Kitchen</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-emerald-300">Accepting Orders</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
                  {restaurant.name}
                </h1>
                
                <p className="text-amber-100/85 text-xs sm:text-base mb-3.5 sm:mb-4.5 leading-relaxed max-w-xl">
                  {restaurant.subtitle}
                </p>

                {/* Key stats row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
                  <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-md border border-emerald-400/30">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                    <span>{restaurant.rating}</span>
                    <span className="text-emerald-100 text-[10px] sm:text-xs font-normal">({restaurant.reviewsCount})</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-white/20 text-white text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-white/20 text-white text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>FSSAI Certified</span>
                  </div>
                </div>
              </div>

              {/* Right: Active Coupon Pills */}
              <div className="lg:w-80 flex flex-col gap-3">
                <div className="bg-gradient-to-b from-white/20 to-white/10 backdrop-blur-xl border border-amber-300/30 rounded-2xl p-3.5 sm:p-4.5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-300" /> Best Deal Available
                    </span>
                    <span className="text-[10px] sm:text-[11px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-sm">
                      SAVE 20%
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-black/45 border border-amber-400/30 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-inner">
                    <span className="font-mono font-black tracking-widest text-amber-300 text-sm sm:text-base">SAVE20</span>
                    <button
                      onClick={() => handleCopyCode('SAVE20')}
                      className="text-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md shadow-amber-500/25 transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === 'SAVE20' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-slate-950" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <span>Copy Code</span>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-amber-200/75 mt-2 leading-snug">
                    Apply at checkout for 20% off on all orders above ₹149!
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Category Showcase Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <div className="relative bg-[#FAF8F5] rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-amber-100/80 shadow-xs overflow-hidden">
          {/* Subtle warm ambient background glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-200/15 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header with Desktop Carousel Controls */}
          <div className="flex items-center justify-between mb-3 sm:mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Inspiration for your order
                </h2>
              </div>
              <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 font-medium">
                Tap any category to explore authentic dishes
              </p>
            </div>

            {/* Scroll Navigation Chevrons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:text-amber-600 hover:border-amber-300 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:text-amber-600 hover:border-amber-300 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal Category Strip */}
          <div className="relative">
            {/* Soft Edge Fade Fringes */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-l from-[#FAF8F5] to-transparent z-10" />

            <div
              ref={categoryScrollRef}
              className="flex items-start gap-3 sm:gap-6 md:gap-7 overflow-x-auto scroll-smooth py-2.5 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="group flex flex-col items-center flex-shrink-0 cursor-pointer transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none select-none"
                    style={{ minWidth: '74px', maxWidth: '96px' }}
                  >
                    {/* Circle Card with Soft Shadow */}
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full bg-white flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1.5 ${
                        isActive
                          ? 'ring-3 ring-amber-500 ring-offset-2 ring-offset-[#FAF8F5] shadow-[0_12px_28px_rgba(245,158,11,0.28)] bg-gradient-to-b from-white to-amber-50/50 scale-105'
                          : 'shadow-[0_8px_20px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] group-hover:shadow-[0_16px_30px_rgba(0,0,0,0.12)]'
                      }`}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-9 h-9 sm:w-12 sm:h-12 md:w-13 md:h-13 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xs pointer-events-none"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      <span className="hidden text-3xl sm:text-4xl pointer-events-none">
                        {cat.icon}
                      </span>
                    </div>

                    {/* Category Label Underneath */}
                    <div className="mt-2 text-center w-full">
                      <span
                        className={`block text-[11px] sm:text-sm tracking-tight transition-colors duration-200 leading-tight ${
                          isActive
                            ? 'font-bold text-amber-600'
                            : 'font-semibold text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        {cat.name}
                      </span>
                      {isActive && (
                        <div className="w-4 sm:w-5 h-1 bg-amber-500 rounded-full mx-auto mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Category & Search Navigation Section */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-md border-y border-slate-200/80 shadow-xs mt-4 sm:mt-6 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          
          {/* Top row: Search input + Veg/NonVeg Switch + Sort */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="menu-search-input"
                type="text"
                placeholder="Search dishes (e.g. Biryani, Paneer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Middle: Veg / Non-Veg segmented pill */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl w-full md:w-auto justify-center">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  dietaryFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Dishes
              </button>
              <button
                onClick={() => setDietaryFilter('veg')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  dietaryFilter === 'veg'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 border border-white shrink-0" />
                <span>Veg Only</span>
              </button>
              <button
                onClick={() => setDietaryFilter('nonveg')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  dietaryFilter === 'nonveg'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 border border-white shrink-0" />
                <span>Non-Veg</span>
              </button>
            </div>

            {/* Sort & View Mode Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="popular">🔥 Most Popular</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="price_low">💰 Price: Low to High</option>
                  <option value="price_high">💎 Price: High to Low</option>
                  <option value="quick">⚡ Fastest Prep</option>
                </select>
              </div>

              {/* View Switcher: Grid vs List */}
              <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200/60 shadow-2xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs scale-105'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid View (Compact)"
                >
                  <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-900 shadow-xs scale-105'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="List View (Detailed)"
                >
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Quick Filter Chips & Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          
          {/* Quick pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Quick:</span>
            {quickFilters.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuickFilter(q.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedQuickFilter === q.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Results count & reset */}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{filteredItems.length}</strong> items
            </span>

            {(activeCategory !== 'all' || searchQuery || dietaryFilter !== 'all' || selectedQuickFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 hover:underline font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Food Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-7">
        {filteredItems.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🔍
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No matching dishes found</h3>
            <p className="text-slate-500 text-sm mb-6">
              We couldn't find anything matching your search criteria. Try clearing some filters or searching for something else!
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* RESPONSIVE GRID VIEW (2 cols mobile, 3 cols tablet, 4 cols desktop) */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
                >
                  {/* Top Image & Badges */}
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => setActiveModalItem(item)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Tag badge (Bestseller, Chef Special, etc.) */}
                    {item.tag && (
                      <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-slate-900/85 backdrop-blur-md text-amber-400 font-extrabold text-[9px] sm:text-[11px] px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs flex items-center gap-1 border border-white/10">
                        {item.tag}
                      </div>
                    )}

                    {/* Veg / Non-Veg Indian FSSAI symbol */}
                    <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-white/95 backdrop-blur-md p-0.5 sm:p-1 rounded-sm sm:rounded-md shadow-xs">
                      <div
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs border-[1.5px] sm:border-2 flex items-center justify-center ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Prep time badge bottom-left */}
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                      <span>{item.prepTime}</span>
                    </div>

                    {/* Quick view hint on desktop */}
                    <div className="absolute bottom-2 right-2 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      Quick View 👁️
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-2.5 sm:p-3.5 md:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name & Rating */}
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3
                          onClick={() => setActiveModalItem(item)}
                          className="font-bold text-slate-900 text-xs sm:text-sm md:text-base leading-tight group-hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-0.5 bg-amber-50 px-1 py-0.5 rounded text-amber-800 text-[10px] sm:text-xs font-bold flex-shrink-0">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500 text-amber-500" />
                          <span>{item.rating}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-500 text-[11px] sm:text-xs line-clamp-1 sm:line-clamp-2 mb-2 leading-tight sm:leading-relaxed">
                        {item.description}
                      </p>

                      {/* Nutritional snippet */}
                      <div className="flex items-center gap-1 text-[9px] sm:text-[10px] md:text-[11px] text-slate-500 font-medium mb-2.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm">🔥 {item.calories} kcal</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm hidden xs:inline-block">💪 {item.protein}</span>
                      </div>
                    </div>

                    {/* Price and Add button bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto gap-1">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm sm:text-base md:text-lg font-black text-slate-900">₹{item.price}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-[10px] sm:text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                          )}
                        </div>
                        {item.originalPrice > item.price && (
                          <span className="text-[9px] sm:text-[10px] text-emerald-600 font-extrabold uppercase">
                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      {/* ADD or Counter Button */}
                      <div>
                        {qty === 0 ? (
                          <button
                            id={`add-btn-${item.id}`}
                            onClick={() => handleAdd(item)}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] sm:text-xs font-black px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>ADD</span>
                          </button>
                        ) : (
                          <div className="flex items-center bg-amber-50 border border-amber-300 rounded-lg sm:rounded-xl px-1.5 py-0.5 sm:px-2 sm:py-1 gap-1 sm:gap-1.5 shadow-xs">
                            <button
                              id={`minus-btn-${item.id}`}
                              onClick={() => updateQuantity(item.id, qty - 1)}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                            >
                              <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                            </button>
                            <span className="text-[11px] sm:text-xs font-black text-slate-900 w-3 sm:w-4 text-center">{qty}</span>
                            <button
                              id={`plus-btn-${item.id}`}
                              onClick={() => updateQuantity(item.id, qty + 1)}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                            >
                              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* RESPONSIVE LIST VIEW (Horizontal cards - Swiggy/Zomato style) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-amber-300 transition-all flex gap-3 sm:gap-4 justify-between items-center"
                >
                  {/* Left Side Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Veg / Non-Veg Icon */}
                      <div
                        className={`w-3.5 h-3.5 rounded-xs border-2 bg-white flex items-center justify-center flex-shrink-0 ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </div>

                      {item.tag && (
                        <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200/60">
                          {item.tag}
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => setActiveModalItem(item)}
                      className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 my-1">
                      <span className="text-base font-black text-slate-900">₹{item.price}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                      )}
                      <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded text-amber-800 text-[11px] font-bold ml-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-medium">
                      <span>⏱️ {item.prepTime}</span>
                      <span>•</span>
                      <span>🔥 {item.calories} kcal</span>
                      <span>•</span>
                      <span>💪 {item.protein}</span>
                    </div>
                  </div>

                  {/* Right Side Image & Floating ADD Button */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => setActiveModalItem(item)}
                      loading="lazy"
                    />

                    {/* Floating ADD or Stepper Button */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 shadow-md">
                      {qty === 0 ? (
                        <button
                          id={`add-btn-list-${item.id}`}
                          onClick={() => handleAdd(item)}
                          className="bg-white hover:bg-amber-50 text-emerald-700 hover:text-emerald-800 font-black text-xs px-3.5 py-1 rounded-lg border border-slate-200 shadow-sm transition-all hover:scale-105 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>ADD</span>
                        </button>
                      ) : (
                        <div className="flex items-center bg-white border border-amber-300 rounded-lg px-1.5 py-0.5 gap-1.5 shadow-md">
                          <button
                            id={`minus-btn-list-${item.id}`}
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-3 sm:w-4 text-center">{qty}</span>
                          <button
                            id={`plus-btn-list-${item.id}`}
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dish Quick View Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-slide-up my-auto">
            
            {/* Modal Image Header */}
            <div className="relative aspect-16/9 bg-slate-900">
              <img
                src={activeModalItem.image}
                alt={activeModalItem.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/60 hover:bg-black text-white p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2.5 left-3 sm:bottom-3 sm:left-4 flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-white" /> {activeModalItem.rating} ({activeModalItem.reviews} reviews)
                </span>
                <span className="bg-black/70 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full">
                  ⏱️ {activeModalItem.prepTime}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">{activeModalItem.name}</h2>
                  <p className="text-[11px] sm:text-xs text-amber-600 font-bold uppercase tracking-wider mt-0.5">
                    {activeModalItem.serves} • Spice: {activeModalItem.spiceLevel}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-slate-900">₹{activeModalItem.price}</div>
                  {activeModalItem.originalPrice > activeModalItem.price && (
                    <div className="text-[11px] sm:text-xs text-slate-400 line-through">₹{activeModalItem.originalPrice}</div>
                  )}
                </div>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
                {activeModalItem.description}
              </p>

              {/* Nutrition breakdown cards */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 text-center">
                <div className="bg-orange-50/60 p-1.5 sm:p-2 rounded-xl border border-orange-100">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase">Calories</div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">{activeModalItem.calories} kcal</div>
                </div>
                <div className="bg-emerald-50/60 p-1.5 sm:p-2 rounded-xl border border-emerald-100">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase">Protein</div>
                  <div className="text-xs sm:text-sm font-black text-emerald-700">{activeModalItem.protein}</div>
                </div>
                <div className="bg-blue-50/60 p-1.5 sm:p-2 rounded-xl border border-blue-100">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase">Diet</div>
                  <div className="text-xs sm:text-sm font-black text-blue-700">{activeModalItem.isVeg ? 'Veg' : 'Non-Veg'}</div>
                </div>
                <div className="bg-purple-50/60 p-1.5 sm:p-2 rounded-xl border border-purple-100">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase">Spice</div>
                  <div className="text-xs sm:text-sm font-black text-purple-700">{activeModalItem.spiceLevel}</div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-5">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Key Ingredients</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalItem.ingredients.map((ing, i) => (
                    <span key={i} className="text-[11px] sm:text-xs bg-slate-100 text-slate-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-medium">
                      ✓ {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    handleAdd(activeModalItem);
                    setActiveModalItem(null);
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart • ₹{activeModalItem.price}</span>
                </button>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Customer Trust & Quality Assurance Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-orange-200/60">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
              Bitez Promise
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Cooked Fresh with Mother's Touch & Hygiene
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Every dish is freshly cooked on your order, packed in leak-proof insulated containers to arrive piping hot.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-center">
            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs border border-orange-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl">
                🧼
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">FSSAI Certified</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">100% sanitized cloud kitchen.</p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs border border-orange-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl">
                ⚡
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Piping Hot Delivery</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Insulated thermal boxes keep food hot.</p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs border border-orange-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl">
                🌱
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Pure Segregation</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Dedicated utensils for veg food.</p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs border border-orange-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl">
                🔄
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Instant Replacement</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">100% money-back satisfaction.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Quick Cart Bar (Visible when items > 0) */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl animate-slide-up">
          <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800 text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left cart stats */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 bg-amber-500 text-slate-950 rounded-lg sm:rounded-xl flex items-center justify-center font-black flex-shrink-0">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] sm:text-[11px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                  {totalItems}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                  {totalItems} {totalItems === 1 ? 'dish' : 'dishes'} added
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  ₹{totalAmount}
                </div>
              </div>
            </div>

            {/* Delivery threshold message (hidden on mobile, visible on desktop) */}
            <div className="hidden md:block text-xs text-slate-300">
              {remainingForFreeDelivery > 0 ? (
                <span>Add <strong className="text-amber-400">₹{remainingForFreeDelivery}</strong> for Free Delivery 🚚</span>
              ) : (
                <span className="text-emerald-400 font-bold">🎉 FREE Delivery!</span>
              )}
            </div>

            {/* Proceed to Cart Button */}
            <Link
              to="/cart"
              id="view-cart-floating-btn"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-1.5 sm:gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
            >
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </Link>

          </div>
        </div>
      )}

    </div>
  );
};

export default Menu;