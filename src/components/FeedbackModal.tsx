import React, { useState } from 'react';
import { X, Star, Send, Camera, Smile, Frown, Meh, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  restaurantName?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  orderId, 
  restaurantName 
}) => {
  const [ratings, setRatings] = useState({
    food: 0,
    delivery: 0,
    packaging: 0,
    overall: 0
  });
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showThankYou, setShowThankYou] = useState(false);

  const feedbackTags = [
    'Delicious Food',
    'Quick Delivery',
    'Good Packaging',
    'Polite Delivery Partner',
    'Hot & Fresh',
    'Value for Money',
    'Poor Quality',
    'Late Delivery',
    'Cold Food',
    'Wrong Order',
    'Damaged Packaging',
    'Rude Behavior'
  ];

  const ratingCategories = [
    { key: 'food', label: 'Food Quality', icon: '🍽️' },
    { key: 'delivery', label: 'Delivery Time', icon: '🚚' },
    { key: 'packaging', label: 'Packaging', icon: '📦' },
    { key: 'overall', label: 'Overall Experience', icon: '⭐' }
  ];

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate feedback submission
    setShowThankYou(true);
    setTimeout(() => {
      setShowThankYou(false);
      onClose();
      // Reset form
      setRatings({ food: 0, delivery: 0, packaging: 0, overall: 0 });
      setFeedback('');
      setSelectedTags([]);
    }, 2000);
  };

  const getOverallSentiment = () => {
    const avgRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / 4;
    if (avgRating >= 4) return { icon: <Smile className="w-8 h-8 text-green-500" />, text: 'Great!', color: 'text-green-600' };
    if (avgRating >= 3) return { icon: <Meh className="w-8 h-8 text-yellow-500" />, text: 'Good', color: 'text-yellow-600' };
    return { icon: <Frown className="w-8 h-8 text-red-500" />, text: 'Needs Improvement', color: 'text-red-600' };
  };

  if (!isOpen) return null;

  if (showThankYou) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">Your feedback has been submitted successfully. We appreciate your input!</p>
        </div>
      </div>
    );
  }

  const sentiment = getOverallSentiment();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Rate Your Experience</h2>
              {restaurantName && (
                <p className="text-gray-600">{restaurantName}</p>
              )}
              {orderId && (
                <p className="text-sm text-gray-500">Order #{orderId}</p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Sentiment */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              {sentiment.icon}
            </div>
            <p className={`text-lg font-semibold ${sentiment.color}`}>{sentiment.text}</p>
          </div>

          {/* Rating Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rate Different Aspects</h3>
            {ratingCategories.map((category) => (
              <div key={category.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-medium">{category.label}</span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(category.key, star)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= ratings[category.key as keyof typeof ratings]
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Tags (Optional)</h3>
            <div className="flex flex-wrap gap-2">
              {feedbackTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Share more details about your experience..."
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Click to upload photos</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <Send className="w-4 h-4 inline mr-2" />
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;