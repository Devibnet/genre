import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IconChevronLeft, IconChevronRight } from './Icons';
import './AutoSlider.css';

/**
 * AutoSlider - Smooth, interactive responsive carousel with auto-sliding,
 * touch swipe, pause on hover, navigation arrows, and pagination pill dots.
 */
const AutoSlider = ({
  items = [],
  renderItem,
  itemsPerView = { desktop: 3, tablet: 2, mobile: 1 },
  autoSlideInterval = 4500,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [perView, setPerView] = useState(itemsPerView.desktop || 3);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const sliderRef = useRef(null);

  // Update visible items count based on viewport width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setPerView(itemsPerView.mobile || 1);
      } else if (width < 1024) {
        setPerView(itemsPerView.tablet || 2);
      } else {
        setPerView(itemsPerView.desktop || 3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerView]);

  // If items length is <= perView but >= 2, duplicate items to allow continuous sliding
  const displayItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    if (items.length > 1 && items.length <= perView) {
      let duplicated = [...items];
      while (duplicated.length <= perView + 1) {
        duplicated = duplicated.concat(items);
      }
      return duplicated;
    }
    return items;
  }, [items, perView]);

  const maxIndex = Math.max(0, displayItems.length - perView);

  // Keep index in bounds on window resize or items change
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const nextSlide = useCallback(() => {
    if (displayItems.length <= perView) return;
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [displayItems.length, maxIndex, perView]);

  const prevSlide = useCallback(() => {
    if (displayItems.length <= perView) return;
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [displayItems.length, maxIndex, perView]);

  const goToSlide = (index) => {
    setCurrentIndex(Math.min(Math.max(0, index), maxIndex));
  };

  // Auto slide interval
  useEffect(() => {
    if (isHovered || displayItems.length <= perView || autoSlideInterval <= 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [isHovered, displayItems.length, perView, autoSlideInterval, nextSlide]);

  // Touch handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!items || items.length === 0) return null;

  const cardWidthPercent = 100 / perView;
  const transformValue = `translateX(-${currentIndex * cardWidthPercent}%)`;
  const totalDots = maxIndex + 1;

  return (
    <div
      className={`auto-slider-wrapper ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={sliderRef}
    >
      <div
        className="auto-slider-viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="auto-slider-track"
          style={{
            transform: transformValue,
            transition: 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {displayItems.map((item, idx) => (
            <div
              key={item.id ? `${item.id}-${idx}` : idx}
              className="auto-slider-item"
              style={{
                flex: `0 0 ${cardWidthPercent}%`,
                maxWidth: `${cardWidthPercent}%`,
              }}
            >
              {renderItem ? renderItem(item, idx) : item}
            </div>
          ))}
        </div>
      </div>

      {displayItems.length > perView && (
        <div className="auto-slider-controls">
          <button
            type="button"
            className="slider-nav-btn slider-prev"
            onClick={prevSlide}
            aria-label="Slide Sebelumnya"
          >
            <IconChevronLeft size={18} />
          </button>

          <div className="slider-dots">
            {Array.from({ length: totalDots }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                className={`slider-dot ${dotIdx === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(dotIdx)}
                aria-label={`Ke slide ${dotIdx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="slider-nav-btn slider-next"
            onClick={nextSlide}
            aria-label="Slide Selanjutnya"
          >
            <IconChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AutoSlider;
