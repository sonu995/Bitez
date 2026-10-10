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
    setShowThankYou(true);
    setTimeout(() => {
      setShowThankYou(false);
      onClose();
      setRatings({ food: 0, delivery: 0, packaging: 0, overall: 0 });
      setFeedback('');
      setSelectedTags([]);
    }, 2000);
  };

  const getOverallSentiment = () => {
    const avgRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / 4;
    if (avgRating >= 4) return { icon: <Smile className="w-8 h-8 text-emerald-500" />, text: 'Great!', color: 'text-emerald-600' };
    if (avgRating >= 3) return { icon: <Meh className="w-8 h-8 text-amber-500" />, text: 'Good', color: 'text-amber-600' };
    return { icon: <Frown className="w-8 h-8 text-rose-500" />, text: 'Needs Improvement', color: 'text-rose-600' };
  };

  if (!isOpen) return null;

  if (showThankYou) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-600 text-sm">Your feedback helps Bitez keep quality and taste at their highest standards!</p>
        </div>
      </div>
    );
  }

  const sentiment = getOverallSentiment();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Rate Your Experience</h2>
              {restaurantName && (
                <p className="text-slate-600 text-sm mt-0.5">{restaurantName}</p>
              )}
              {orderId && (
                <p className="text-xs font-semibold text-slate-400">Order #{orderId}</p>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Sentiment */}
          <div className="text-center py-2">
            <div className="flex justify-center mb-2">
              {sentiment.icon}
            </div>
            <p className={`text-base font-bold ${sentiment.color}`}>{sentiment.text}</p>
          </div>

          {/* Rating Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Rate Different Aspects</h3>
            {ratingCategories.map((category) => (
              <div key={category.key} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-semibold text-slate-800 text-sm">{category.label}</span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(category.key, star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          star <= ratings[category.key as keyof typeof ratings]
                            ? 'text-orange-500 fill-orange-500' 
                            : 'text-slate-300'
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Quick Tags (Optional)</h3>
            <div className="flex flex-wrap gap-2">
              {feedbackTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 outline-none"
              placeholder="Share more details about your meal or delivery..."
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Add Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-6 text-center transition-colors cursor-pointer bg-slate-50/50">
              <Camera className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
              <p className="text-slate-600 text-xs font-medium">Click to upload photos</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;