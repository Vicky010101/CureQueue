import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import API from '../api';
import { toast } from 'sonner';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, appointment, doctorName }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      await API.post('/reviews/add', {
        appointmentId: appointment._id || appointment.id,
        doctorId: appointment.doctorId,
        rating,
        comment: comment.trim()
      });

      toast.success('Thank you for your feedback!');
      onClose(true); // Pass true to indicate successful submission
    } catch (error) {
      console.error('Review submission error:', error);
      const errorMessage = error.response?.data?.msg || 'Failed to submit review';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="review-modal-overlay" onClick={handleClose}>
          <motion.div
            className="review-modal-container"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              className="review-modal-close"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="review-modal-header">
              <h2 className="review-modal-title">
                Rate Your Experience with {doctorName || 'Doctor'}
              </h2>
              <p className="review-modal-subtitle">
                How was your recent appointment? Your feedback helps us improve.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="review-modal-form">
              {/* Star Rating */}
              <div className="review-rating-container">
                <label className="review-label">Your Rating *</label>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`review-star ${
                        value <= (hoveredRating || rating) ? 'active' : ''
                      }`}
                      onClick={() => handleRatingClick(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(0)}
                      disabled={isSubmitting}
                      aria-label={`Rate ${value} stars`}
                    >
                      <Star
                        size={32}
                        fill={value <= (hoveredRating || rating) ? '#0f766e' : 'none'}
                        stroke={value <= (hoveredRating || rating) ? '#0f766e' : '#d1d5db'}
                      />
                    </button>
                  ))}
                </div>
                <p className="review-rating-text">
                  {rating > 0 && (
                    <span>
                      {rating === 5 && 'Excellent!'}
                      {rating === 4 && 'Very Good!'}
                      {rating === 3 && 'Good'}
                      {rating === 2 && 'Fair'}
                      {rating === 1 && 'Poor'}
                    </span>
                  )}
                </p>
              </div>

              {/* Comment Textarea */}
              <div className="review-comment-container">
                <label htmlFor="review-comment" className="review-label">
                  Share Your Experience (Optional)
                </label>
                <textarea
                  id="review-comment"
                  className="review-textarea"
                  placeholder="Tell us about your experience with the doctor..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <p className="review-char-count">
                  {comment.length}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="review-modal-actions">
                <button
                  type="button"
                  className="review-btn review-btn-cancel"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Maybe Later
                </button>
                <button
                  type="submit"
                  className="review-btn review-btn-submit"
                  disabled={isSubmitting || rating === 0}
                >
                  {isSubmitting ? (
                    <>
                      <span className="review-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
