import React, { useEffect, useState } from 'react';
import API from '../api';
import { motion } from 'framer-motion';
import { Star, User, Calendar, MessageSquare, Award } from 'lucide-react';
import { toast } from 'sonner';
import './DoctorReviews.css';

function DoctorReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, average: 0 });
  const [me, setMe] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Get current user info
        const meRes = await API.get('/api/auth/me');
        if (!isMounted) return;
        setMe(meRes.data.user);

        // Fetch reviews for this doctor
        const reviewsRes = await API.get(`/api/reviews/doctor/${meRes.data.user._id}`);
        if (!isMounted) return;
        
        const fetchedReviews = reviewsRes.data.reviews || [];
        setReviews(fetchedReviews);

        // Calculate stats
        if (fetchedReviews.length > 0) {
          const totalRating = fetchedReviews.reduce((sum, r) => sum + (r.rating || r.stars || 0), 0);
          const avgRating = (totalRating / fetchedReviews.length).toFixed(1);
          setStats({ total: fetchedReviews.length, average: avgRating });
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const renderStars = (rating) => {
    return (
      <div className="doctor-review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? '#fbbf24' : 'none'}
            stroke={star <= rating ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPatientName = (review) => {
    return review.patientId?.name || review.userId?.name || 'Anonymous Patient';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="container-responsive doctor-reviews-container">
        <div className="doctor-reviews-header">
          <h1 className="page-title">My Reviews</h1>
        </div>
        <p className="text-muted">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="container-responsive doctor-reviews-container">
      {/* Header */}
      <div className="doctor-reviews-header">
        <div>
          <h1 className="page-title">My Reviews</h1>
          <p className="page-subtitle">Patient feedback and ratings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="doctor-reviews-stats">
        <motion.div 
          className="doctor-review-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <MessageSquare size={24} color="#2563eb" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.total}</h3>
            <p className="stat-label">Total Reviews</p>
          </div>
        </motion.div>

        <motion.div 
          className="doctor-review-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <Award size={24} color="#d97706" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.average || 'N/A'}</h3>
            <p className="stat-label">Average Rating</p>
          </div>
        </motion.div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <motion.div 
          className="card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="doctor-reviews-empty">
            <Star size={48} color="#d1d5db" />
            <h3>No Reviews Yet</h3>
            <p className="text-muted">Patient reviews will appear here once they submit feedback.</p>
          </div>
        </motion.div>
      ) : (
        <div className="doctor-reviews-grid">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              className="doctor-review-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Card Header */}
              <div className="doctor-review-card-header">
                <div className="doctor-review-patient-info">
                  <div className="doctor-review-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="doctor-review-patient-name">
                      {getPatientName(review)}
                    </h4>
                    <div className="doctor-review-rating-row">
                      {renderStars(review.rating || review.stars || 0)}
                      <span className="doctor-review-rating-value">
                        {review.rating || review.stars || 0}/5
                      </span>
                    </div>
                  </div>
                </div>
                <div className="doctor-review-date">
                  <Calendar size={14} />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>

              {/* Card Body */}
              {review.comment && (
                <div className="doctor-review-card-body">
                  <p className="doctor-review-comment">"{review.comment}"</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorReviews;
