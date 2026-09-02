import React from 'react';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { restaurant } from '../data/restaurant';
import './About.css';

export const About: React.FC = () => {
  return (
    <main className="page-content">
      {/* Page Header */}
      <section className="page-hero about-hero">
        <div className="container">
          <h1>About Us</h1>
          <p>Get to know Surya Multicuisine Restaurant & Cafe</p>
        </div>
      </section>

      {/* About Content */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <img src="/images/restaurant/interior-01.jpg" alt="Surya Restaurant dining area" loading="lazy" />
            </div>
            <div className="about-content">
              <SectionHeading title="Our Restaurant" align="left" />
              <p>
                Surya Multicuisine Restaurant & Cafe is a well-known dining destination located at 97, Vanagaram High Road,
                Sivananda Nagar, Ambattur, Chennai. We offer a diverse menu that brings together the best of multiple cuisines,
                making us a favourite among families and food lovers in the area.
              </p>
              <p>
                Our kitchen serves an extensive range of dishes including aromatic biryanis, flavourful North Indian curries,
                fresh tandoori breads straight from the oven, spicy Indo-Chinese preparations, crispy seafood starters,
                sizzling BBQ, and a wide variety of fresh juices and beverages.
              </p>
              <p>
                With comfortable air-conditioned seating, a modern dining ambience, and friendly service,
                Surya is the perfect spot for everyday meals, family dinners, and casual celebrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisines */}
      <section className="section about-cuisine-section">
        <div className="container">
          <SectionHeading title="What We Serve" subtitle="A diverse menu spanning multiple cuisines, prepared fresh every day" />
          <div className="cuisine-highlights">
            {restaurant.cuisines.map((cuisine) => (
              <div key={cuisine} className="cuisine-highlight-card">
                <span className="cuisine-highlight-name">{cuisine}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dining Experience */}
      <section className="section">
        <div className="container">
          <SectionHeading title="The Dining Experience" subtitle="A comfortable, modern space for every occasion" />
          <div className="experience-grid">
            <div className="experience-card">
              <span className="experience-icon">❄️</span>
              <h3>Air Conditioned</h3>
              <p>Comfortable AC dining for a pleasant experience regardless of the weather</p>
            </div>
            <div className="experience-card">
              <span className="experience-icon">👨‍👩‍👧‍👦</span>
              <h3>Family Dining</h3>
              <p>Spacious seating and a family-friendly atmosphere for all age groups</p>
            </div>
            <div className="experience-card">
              <span className="experience-icon">🛵</span>
              <h3>Delivery Available</h3>
              <p>Get your favourite dishes delivered via Swiggy — fresh and fast</p>
            </div>
            <div className="experience-card">
              <span className="experience-icon">📦</span>
              <h3>Takeaway</h3>
              <p>Quick parcel service for when you're on the go</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section about-cta-section">
        <div className="container">
          <div className="about-cta-card">
            <h2>Come Visit Us</h2>
            <p>{restaurant.address.full}</p>
            <p>{restaurant.hours.days} • {restaurant.hours.display}</p>
            <div className="about-cta-actions">
              <Button variant="primary" size="lg" href="/menu">View Our Menu</Button>
              <Button variant="outline" size="lg" href="/reservations">Reserve a Table</Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
