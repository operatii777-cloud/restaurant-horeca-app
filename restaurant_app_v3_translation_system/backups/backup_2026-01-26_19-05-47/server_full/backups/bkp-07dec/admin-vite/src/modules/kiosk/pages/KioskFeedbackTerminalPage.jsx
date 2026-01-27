import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { 
  Smile, Meh, Frown, Star, MessageSquare, 
  Send, CheckCircle, RefreshCw, Heart
} from 'lucide-react';
import './KioskFeedbackTerminalPage.css';

/**
 * KioskFeedbackTerminalPage - Customer Feedback Terminal
 * Post-meal survey with rating and comments
 * Features:
 * - Quick emoji rating
 * - 5-star detailed rating
 * - Optional comment
 * - NPS score
 */
export const KioskFeedbackTerminalPage = () => {
  const [step, setStep] = useState('rating'); // rating, details, thanks
  const [quickRating, setQuickRating] = useState(null);
  const [detailedRatings, setDetailedRatings] = useState({
    food: 0,
    service: 0,
    ambiance: 0,
    value: 0
  });
  const [comment, setComment] = useState('');
  const [npsScore, setNpsScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const quickOptions = [
    { value: 'great', icon: Smile, label: 'Excelent!', color: '#22c55e' },
    { value: 'ok', icon: Meh, label: 'OK', color: '#fbbf24' },
    { value: 'bad', icon: Frown, label: 'Poate fi mai bine', color: '#ef4444' }
  ];

  const ratingCategories = [
    { key: 'food', label: 'Mâncare', icon: '🍽️' },
    { key: 'service', label: 'Servire', icon: '👨‍🍳' },
    { key: 'ambiance', label: 'Atmosferă', icon: '✨' },
    { key: 'value', label: 'Preț/Calitate', icon: '💰' }
  ];

  const handleQuickRating = (value) => {
    setQuickRating(value);
    if (value === 'great') {
      // Skip to thanks for great ratings (optional detailed feedback)
      setStep('details');
    } else {
      // For OK or bad, ask for details
      setStep('details');
    }
  };

  const handleStarClick = (category, stars) => {
    setDetailedRatings(prev => ({ ...prev, [category]: stars }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Submit feedback
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quick_rating: quickRating,
          detailed_ratings: detailedRatings,
          nps_score: npsScore,
          comment: comment,
          source: 'terminal',
          created_at: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
    
    setSubmitting(false);
    setStep('thanks');
    
    // Reset after 5 seconds
    setTimeout(() => {
      setStep('rating');
      setQuickRating(null);
      setDetailedRatings({ food: 0, service: 0, ambiance: 0, value: 0 });
      setComment('');
      setNpsScore(null);
    }, 5000);
  };

  const StarRating = ({ value, onChange }) => (
    <div className="feedback-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`feedback-star ${star <= value ? 'active' : ''}`}
          onClick={() => onChange(star)}
        >
          <Star size={32} fill={star <= value ? '#fbbf24' : 'none'} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="feedback-page">
      {/* Step 1: Quick Rating */}
      {step === 'rating' && (
        <div className="feedback-step feedback-step--rating">
          <div className="feedback-header">
            <Heart className="feedback-header__icon" size={48} />
            <h1>Cum a fost experiența ta?</h1>
            <p>Părerea ta contează pentru noi!</p>
          </div>
          
          <div className="feedback-quick-options">
            {quickOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  className="feedback-quick-btn"
                  onClick={() => handleQuickRating(option.value)}
                  style={{ '--hover-color': option.color }}
                >
                  <Icon size={80} color={option.color} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Detailed Feedback */}
      {step === 'details' && (
        <div className="feedback-step feedback-step--details">
          <div className="feedback-header">
            <Star className="feedback-header__icon" size={48} />
            <h1>Oferă-ne mai multe detalii</h1>
            <p>Ajută-ne să ne îmbunătățim serviciile</p>
          </div>

          <Card className="feedback-details-card">
            <Card.Body>
              {/* Category Ratings */}
              <div className="feedback-categories">
                {ratingCategories.map((cat) => (
                  <div key={cat.key} className="feedback-category">
                    <div className="feedback-category__label">
                      <span className="feedback-category__icon">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    <StarRating
                      value={detailedRatings[cat.key]}
                      onChange={(stars) => handleStarClick(cat.key, stars)}
                    />
                  </div>
                ))}
              </div>

              {/* NPS */}
              <div className="feedback-nps">
                <h3>Cât de probabil este să ne recomanzi?</h3>
                <div className="feedback-nps__scale">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      className={`feedback-nps__btn ${npsScore === score ? 'active' : ''}`}
                      onClick={() => setNpsScore(score)}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="feedback-nps__labels">
                  <span>Deloc probabil</span>
                  <span>Foarte probabil</span>
                </div>
              </div>

              {/* Comment */}
              <div className="feedback-comment">
                <h3><MessageSquare size={20} /> Comentariu (opțional)</h3>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Spune-ne ce ai mai vrea să îmbunătățim..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <Button 
                variant="success" 
                size="lg" 
                className="feedback-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={20} className="spin me-2" />
                    Se trimite...
                  </>
                ) : (
                  <>
                    <Send size={20} className="me-2" />
                    Trimite Feedback
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>

          <button className="feedback-skip" onClick={() => handleSubmit()}>
            Sări peste detalii
          </button>
        </div>
      )}

      {/* Step 3: Thank You */}
      {step === 'thanks' && (
        <div className="feedback-step feedback-step--thanks">
          <div className="feedback-thanks">
            <div className="feedback-thanks__icon">
              <CheckCircle size={100} />
            </div>
            <h1>Mulțumim!</h1>
            <p>Feedback-ul tău ne ajută să fim mai buni.</p>
            <span className="feedback-thanks__timer">
              Revenire automată în 5 secunde...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskFeedbackTerminalPage;

