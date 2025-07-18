import React, { useState, useEffect } from 'react';
import { Zap, Users, Shield, TrendingUp, Sun, Battery, ArrowRight, Play } from 'lucide-react';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    backgroundElement: {
      position: 'absolute',
      borderRadius: '50%',
      opacity: 0.2,
      animation: 'pulse 2s infinite'
    },
    nav: {
      position: 'relative',
      zIndex: 10,
      padding: '1rem 1.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(34, 197, 94, 0.1)'
    },
    navContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    logoIcon: {
      width: '2rem',
      height: '2rem',
      background: 'linear-gradient(135deg, #22c55e, #059669)',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(90deg, #166534, #059669)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem'
    },
    navLink: {
      color: '#166534',
      textDecoration: 'none',
      transition: 'color 0.3s',
      cursor: 'pointer'
    },
    hero: {
      position: 'relative',
      zIndex: 10,
      padding: '5rem 1.5rem',
      textAlign: 'center'
    },
    heroContainer: {
      maxWidth: '1152px',
      margin: '0 auto'
    },
    heroContent: {
      transform: isVisible ? 'translateY(0)' : 'translateY(2.5rem)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 1s ease-out'
    },
    heroTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      background: 'linear-gradient(90deg, #1f2937, #059669, #166534)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      lineHeight: 1.2
    },
    heroSubtitle: {
      fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
      color: '#166534',
      marginBottom: '3rem',
      maxWidth: '48rem',
      margin: '0 auto 3rem auto',
      lineHeight: 1.6
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '3rem'
    },
    featureCard: {
      padding: '1.5rem',
      borderRadius: '1rem',
      transition: 'all 0.5s ease',
      cursor: 'pointer',
      transform: 'scale(1)',
      textAlign: 'center'
    },
    featureCardActive: {
      background: 'linear-gradient(135deg, #22c55e, #059669)',
      color: 'white',
      transform: 'scale(1.05)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
    },
    featureCardInactive: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      color: '#166534',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
    },
    featureIcon: {
      marginBottom: '1rem'
    },
    featureTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '0.5rem'
    },
    featureDescription: {
      fontSize: '0.875rem',
      opacity: 0.9
    },
    ctaContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      justifyContent: 'center',
      alignItems: 'center'
    },
    ctaButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem 2rem',
      borderRadius: '2rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: 'none',
      textDecoration: 'none'
    },
    ctaPrimary: {
      background: 'linear-gradient(90deg, #22c55e, #059669)',
      color: 'white',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      transform: 'scale(1)'
    },
    ctaSecondary: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      color: '#166534',
      border: '2px solid rgba(34, 197, 94, 0.2)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
    },
    section: {
      padding: '5rem 1.5rem'
    },
    sectionTitle: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '4rem',
      background: 'linear-gradient(90deg, #1f2937, #059669)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    stepsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1152px',
      margin: '0 auto'
    },
    stepCard: {
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    },
    stepNumber: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '4rem',
      height: '4rem',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #22c55e, #059669)',
      color: 'white',
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem'
    },
    stepTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '1rem'
    },
    stepDescription: {
      color: '#6b7280',
      lineHeight: 1.6
    },
    benefitsSection: {
      background: 'linear-gradient(135deg, #1f2937, #059669)',
      color: 'white'
    },
    benefitsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '3rem',
      alignItems: 'center',
      maxWidth: '1152px',
      margin: '0 auto'
    },
    benefitsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    benefitItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.75rem',
      backdropFilter: 'blur(8px)',
      transition: 'backgroundColor 0.3s ease'
    },
    benefitIcon: {
      width: '3rem',
      height: '3rem',
      background: 'linear-gradient(135deg, #22c55e, #059669)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    footer: {
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '3rem 1.5rem'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      maxWidth: '1152px',
      margin: '0 auto'
    },
    footerCopyright: {
      borderTop: '1px solid #374151',
      marginTop: '2rem',
      paddingTop: '2rem',
      textAlign: 'center',
      color: '#9ca3af'
    },
    '@media (min-width: 640px)': {
      ctaContainer: {
        flexDirection: 'row'
      }
    }
  };

  const features = [
    {
      icon: <Zap style={{ width: '2rem', height: '2rem' }} />,
      title: "Instant Energy Trading",
      description: "Buy and sell excess solar power in real-time with your neighbors"
    },
    {
      icon: <Shield style={{ width: '2rem', height: '2rem' }} />,
      title: "Blockchain Security",
      description: "Secure, transparent transactions powered by cutting-edge blockchain technology"
    },
    {
      icon: <TrendingUp style={{ width: '2rem', height: '2rem' }} />,
      title: "Smart Optimization",
      description: "AI-driven algorithms optimize energy distribution for maximum efficiency"
    }
  ];

  const benefits = [
    { icon: <Sun style={{ width: '1.5rem', height: '1.5rem' }} />, text: "Reduce energy costs by up to 40%" },
    { icon: <Battery style={{ width: '1.5rem', height: '1.5rem' }} />, text: "Maximize solar investment returns" },
    { icon: <Users style={{ width: '1.5rem', height: '1.5rem' }} />, text: "Build sustainable communities" },
    { icon: <Shield style={{ width: '1.5rem', height: '1.5rem' }} />, text: "Reduce grid dependency" }
  ];

  const handleGetStarted = () => {
    // Navigate to the authentication page
    window.location.href = '/auth'; // This is a simple redirect. For React Router, use history.push('/auth')
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Zap style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <span style={styles.logoText}>GreenGrid</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#how-it-works" style={styles.navLink}>How It Works</a>
            <a href="#benefits" style={styles.navLink}>Benefits</a>
            {/* Changed Login to navigate to the auth page */}
            <a href="/auth" style={{ ...styles.navLink, background: 'none', border: 'none' }}>Login</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Power Your Future with<br />
              <span style={{ color: '#059669' }}>Peer-to-Peer Energy</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Join the renewable energy revolution. Trade excess solar power with neighbors through our blockchain-powered micro-trading platform.
            </p>
          </div>

          {/* Feature Cards */}
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  ...styles.featureCard,
                  ...(activeFeature === index ? styles.featureCardActive : styles.featureCardInactive)
                }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div style={styles.featureIcon}>
                  {feature.icon}
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={styles.ctaContainer}>
            <button
              onClick={handleGetStarted} // This button now triggers navigation
              style={{ ...styles.ctaButton, ...styles.ctaPrimary }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <span>Get Started</span>
              <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
            <button
              style={{ ...styles.ctaButton, ...styles.ctaSecondary }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <Play style={{ width: '1.25rem', height: '1.25rem' }} />
              <span>Learn More</span>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ ...styles.section, backgroundColor: '#f9fafb' }}>
        <div style={styles.heroContainer}>
          <h2 style={styles.sectionTitle}>How GreenGrid Works</h2>
          <div style={styles.stepsGrid}>
            {[
              {
                step: "01",
                title: "Generate Solar Power",
                description: "Your solar panels generate clean energy throughout the day, often producing more than you consume."
              },
              {
                step: "02",
                title: "Smart Trading",
                description: "Our AI automatically lists your excess energy on the local marketplace at optimal prices."
              },
              {
                step: "03",
                title: "Earn & Save",
                description: "Neighbors purchase your energy while you earn credits and reduce overall community grid dependency."
              }
            ].map((item, index) => (
              <div
                key={index}
                style={styles.stepCard}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-8px)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
              >
                <div style={styles.stepNumber}>{item.step}</div>
                <h3 style={styles.stepTitle}>{item.title}</h3>
                <p style={styles.stepDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" style={{ ...styles.section, ...styles.benefitsSection }}>
        <div style={styles.heroContainer}>
          <h2 style={{ ...styles.sectionTitle, color: 'white' }}>Why Choose GreenGrid?</h2>
          <div style={styles.benefitsGrid}>
            <div style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  style={styles.benefitItem}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <div style={styles.benefitIcon}>
                    {benefit.icon}
                  </div>
                  <span style={{ fontSize: '1.125rem' }}>{benefit.text}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '1.5rem',
                padding: '2rem',
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '1rem' }}>40%</div>
                <div style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Average Energy Cost Reduction</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '1rem' }}>$1,200+</div>
                <div style={{ fontSize: '1.125rem' }}>Annual Savings Per Household</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <Zap style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <span style={{ ...styles.logoText, color: 'white' }}>GreenGrid</span>
            </div>
            <p style={{ color: '#9ca3af', marginTop: '1rem' }}>
              Empowering communities through peer-to-peer renewable energy trading.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#9ca3af' }}>
              <div>How It Works</div>
              <div>Benefits</div>
              <div>Pricing</div>
              <div>Support</div>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#9ca3af' }}>
              <div>About</div>
              <div>Blog</div>
              <div>Careers</div>
              <div>Contact</div>
            </div>
          </div>
        </div>
        <div style={styles.footerCopyright}>
          <p>&copy; 2025 GreenGrid. All rights reserved. Powering the future of energy.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
