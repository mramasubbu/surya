import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { SectionHeading } from '../components/common/SectionHeading';
import { useInView } from '../hooks/useInView';
import { restaurant } from '../data/restaurant';
import { getPopularItems, menuCategories } from '../data/menu';
import { galleryImages } from '../data/gallery';
import './Home.css';

const popularItems = getPopularItems().slice(0, 6);

const highlights = [
  { icon: '🍽️', title: 'Multicuisine Dining', desc: 'North Indian, Chinese, Tandoori, Seafood & BBQ under one roof' },
  { icon: '👨‍👩‍👧‍👦', title: 'Family Friendly', desc: 'Comfortable AC dining for families and groups' },
  { icon: '🛵', title: 'Delivery & Takeaway', desc: 'Order online via Swiggy or pick up your favourites' },
  { icon: '📍', title: 'Convenient Location', desc: 'Vanagaram High Road, Ambattur — easy to find and reach' },
];

const featuredCategories = menuCategories.filter(c => c.image).slice(0, 6);

export const Home: React.FC = () => {
  return (
    <main>
      {/* Hero */}
      <HeroSection />

      {/* Introduction */}
      <IntroSection />

      {/* Featured Dishes */}
      <section className="section" id="featured-dishes">
        <div className="container">
          <SectionHeading title="Popular Dishes" subtitle="Discover some of our most-loved dishes, freshly prepared with authentic flavours" />
          <div className="featured-grid">
            {popularItems.map((item, i) => (
              <FeaturedCard key={item.id} item={item} index={i} />
            ))}
          </div>
          <div className="section-cta">
            <Button variant="outline" size="lg" href="/menu">View Full Menu</Button>
          </div>
        </div>
      </section>

      {/* Cuisine Categories */}
      <section className="section cuisine-section" id="cuisines">
        <div className="container">
          <SectionHeading title="Explore Our Menu" subtitle="From aromatic biryanis to sizzling BBQ — find your favourite cuisine" />
          <div className="cuisine-grid">
            {featuredCategories.map((cat, i) => (
              <Link to="/menu" key={cat.id} className={`cuisine-card animate-fade-in-up delay-${i + 1}`} style={{ animationPlayState: 'paused' }}>
                <div className="cuisine-card-img">
                  <img src={cat.image} alt={cat.name} loading="lazy" />
                  <div className="cuisine-card-overlay" />
                </div>
                <div className="cuisine-card-content">
                  <h3>{cat.name}</h3>
                  <p>{cat.items.length} items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="section highlights-section" id="highlights">
        <div className="container">
          <SectionHeading title="Why Dine With Us" subtitle="A comfortable dining experience with great food at affordable prices" />
          <div className="highlights-grid">
            {highlights.map((h, i) => (
              <HighlightCard key={i} {...h} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="section" id="gallery-preview">
        <div className="container">
          <SectionHeading title="A Glimpse Inside" subtitle="Take a peek at our food, ambience, and dining experience" />
          <div className="gallery-preview-grid">
            {galleryImages.slice(0, 6).map((img) => (
              <div key={img.id} className="gallery-preview-item">
                <img src={img.src} alt={img.alt} loading="lazy" />
              </div>
            ))}
          </div>
          <div className="section-cta">
            <Button variant="outline" size="lg" href="/gallery">View Full Gallery</Button>
          </div>
        </div>
      </section>

      {/* Google Reviews */}
      <section className="section reviews-section" id="reviews">
        <div className="container">
          <div className="reviews-card">
            <div className="reviews-content">
              <h2>What Our Guests Say</h2>
              <div className="reviews-rating">
                <span className="reviews-stars">⭐⭐⭐⭐</span>
                <span className="reviews-score">{restaurant.rating.score}/5</span>
                <span className="reviews-count">({restaurant.rating.count}+ ratings on {restaurant.rating.platform})</span>
              </div>
              <p>Our guests love the multicuisine variety, generous portions, and friendly service. See what they have to say!</p>
              <Button variant="primary" size="lg" href={restaurant.links.googleReviews} target="_blank">Read Google Reviews</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Order Online */}
      <section className="section order-section" id="order-online">
        <div className="container">
          <div className="order-card">
            <div className="order-content">
              <h2>Order Online</h2>
              <p>Get your favourite dishes delivered to your doorstep</p>
              <div className="order-buttons">
                <Button variant="primary" size="lg" href={restaurant.links.swiggy} target="_blank" icon={<span>🛵</span>}>Order on Swiggy</Button>
                <Button variant="outline" size="lg" href={restaurant.links.district} target="_blank" icon={<span>🍽️</span>}>View on Zomato</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section" id="location">
        <div className="container">
          <SectionHeading title="Find Us" subtitle="Conveniently located on Vanagaram High Road, Ambattur" />
          <div className="location-card">
            <div className="location-map">
              <iframe
                title="Surya Multicuisine Restaurant location on Google Maps"
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.0!2d${restaurant.location.lng}!3d${restaurant.location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA2JzI3LjEiTiA4MMKwMDknMDcuMCJF!5e0!3m2!1sen!2sin!4v1700000000000`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="location-info">
              <h3>{restaurant.name}</h3>
              <p className="location-address">{restaurant.address.full}</p>
              <p className="location-hours">
                <strong>Open:</strong> {restaurant.hours.days}<br />
                {restaurant.hours.display}
              </p>
              <div className="location-actions">
                <Button variant="primary" href={restaurant.links.directions} target="_blank" icon={<span>🗺️</span>}>Get Directions</Button>
                <Button variant="secondary" href={`tel:${restaurant.contact.phone}`} icon={<span>📞</span>}>Call Us</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="section reservation-cta-section" id="reserve-cta">
        <div className="container">
          <div className="reservation-cta-card">
            <h2>Reserve Your Table</h2>
            <p>Planning a family dinner or a special occasion? Book a table in advance via WhatsApp.</p>
            <Button variant="primary" size="lg" href="/reservations" icon={<span>📅</span>}>Make a Reservation</Button>
          </div>
        </div>
      </section>
    </main>
  );
};

/* --- Sub-components --- */

const HeroSection: React.FC = () => {
  const { ref, isInView } = useInView(0.1);
  return (
    <section className="hero" ref={ref}>
      <div className="hero-bg">
        <img src="/images/restaurant/hero-food-spread.jpg" alt="Multicuisine food spread at Surya Restaurant" />
        <div className="hero-overlay" />
      </div>
      <div className={`hero-content container ${isInView ? 'animate-fade-in-up' : 'pre-animate'}`}>
        <span className="hero-badge">Multicuisine Restaurant & Cafe</span>
        <h1 className="hero-title">Surya</h1>
        <p className="hero-subtitle">
          Authentic North Indian, Chinese, Tandoori, Seafood & BBQ — all under one roof in Ambattur, Chennai.
        </p>
        <div className="hero-actions">
          <Button variant="primary" size="lg" href="/menu">View Menu</Button>
          <Button variant="secondary" size="lg" href={restaurant.links.swiggy} target="_blank">Order Online</Button>
        </div>
      </div>
    </section>
  );
};

const IntroSection: React.FC = () => {
  const { ref, isInView } = useInView();
  return (
    <section className="section intro-section" id="about-intro" ref={ref}>
      <div className={`container intro-grid ${isInView ? 'animate-fade-in-up' : 'pre-animate'}`}>
        <div className="intro-image">
          <img src="/images/restaurant/interior-01.jpg" alt="Surya Restaurant modern dining interior" loading="lazy" />
        </div>
        <div className="intro-content">
          <div className="section-heading-accent" />
          <h2>Welcome to Surya</h2>
          <p>
            Surya Multicuisine Restaurant & Cafe is a popular dining destination on Vanagaram High Road in Ambattur, Chennai.
            We offer an extensive menu spanning North Indian curries, aromatic biryanis, tandoori specialities, Indo-Chinese favourites,
            fresh seafood, and sizzling BBQ — all served in a modern, air-conditioned setting.
          </p>
          <p>
            Whether you're looking for a satisfying family meal, a quick lunch, or ordering your favourite dishes for delivery,
            Surya has something for everyone at affordable prices.
          </p>
          <div className="intro-stats">
            <div className="intro-stat">
              <span className="intro-stat-number">200+</span>
              <span className="intro-stat-label">Menu Items</span>
            </div>
            <div className="intro-stat">
              <span className="intro-stat-number">9</span>
              <span className="intro-stat-label">Cuisine Types</span>
            </div>
            <div className="intro-stat">
              <span className="intro-stat-number">{restaurant.rating.score}</span>
              <span className="intro-stat-label">Rating</span>
            </div>
          </div>
          <Button variant="outline" href="/about">Learn More About Us</Button>
        </div>
      </div>
    </section>
  );
};

const FeaturedCard: React.FC<{ item: ReturnType<typeof getPopularItems>[0]; index: number }> = ({ item, index }) => {
  const { ref, isInView } = useInView();
  const categoryImages: Record<string, string> = {
    'Chicken Lollipop': '/images/menu/chilli-chicken.jpg',
    'Chicken 65 Bone': '/images/menu/chilli-chicken.jpg',
    'Chilli Chicken': '/images/menu/chilli-chicken.jpg',
    'Mutton Chukka': '/images/menu/tandoori-chicken.jpg',
    'Chicken Biryani': '/images/menu/chicken-biryani.jpg',
    'Chicken Dum Biryani': '/images/menu/chicken-biryani.jpg',
    'Mutton Biryani': '/images/menu/chicken-biryani.jpg',
    'Paneer 65': '/images/menu/paneer-butter-masala.jpg',
    'Butter Naan': '/images/menu/naan-breads.jpg',
    'Garlic Naan': '/images/menu/naan-breads.jpg',
    'BBQ Chicken': '/images/menu/bbq-chicken.jpg',
  };
  const img = categoryImages[item.name] || '/images/restaurant/hero-food-spread.jpg';

  return (
    <div ref={ref} className={`featured-card ${isInView ? 'animate-fade-in-up' : 'pre-animate'}`} style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="featured-card-img">
        <img src={img} alt={item.name} loading="lazy" />
        <span className={`diet-indicator ${item.diet}`} />
      </div>
      <div className="featured-card-body">
        <h3>{item.name}</h3>
        <p className="featured-card-price">₹{item.price}</p>
      </div>
    </div>
  );
};

const HighlightCard: React.FC<{ icon: string; title: string; desc: string; index: number }> = ({ icon, title, desc, index }) => {
  const { ref, isInView } = useInView();
  return (
    <div ref={ref} className={`highlight-card ${isInView ? 'animate-fade-in-up' : 'pre-animate'}`} style={{ animationDelay: `${index * 0.1}s` }}>
      <span className="highlight-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
};

export default Home;
