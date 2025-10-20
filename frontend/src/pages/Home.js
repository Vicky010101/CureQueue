import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Home as HomeIcon, 
  Users, 
  Bot, 
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Star,
  Heart,
  Shield,
  Award,
  Menu,
  X
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Handle contact form
  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Update active section on scroll and close mobile menu
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'doctors', 'contact'];
      const scrollPosition = window.scrollY + 100;

      // Close mobile menu on scroll
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.home-navbar')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Services data
  const services = [
    {
      icon: <Calendar size={40} />,
      title: 'Appointment Booking',
      description: 'Schedule appointments with your preferred doctors easily and manage your healthcare visits.',
      color: '#0f766e'
    },
    {
      icon: <Clock size={40} />,
      title: 'Queue Tracking',
      description: 'Real-time queue updates to help you plan your visit and reduce waiting time.',
      color: '#0d9488'
    },
    {
      icon: <HomeIcon size={40} />,
      title: 'Home Visit Requests',
      description: 'Request home visits for elderly patients or those who cannot travel to the clinic.',
      color: '#14b8a6'
    },
    {
      icon: <Users size={40} />,
      title: 'Doctor Profiles',
      description: 'Browse detailed profiles of healthcare providers and find the right specialist.',
      color: '#2dd4bf'
    },
    {
      icon: <Bot size={40} />,
      title: 'Health Assistant',
      description: 'AI-powered health assistant to answer your medical questions and provide guidance.',
      color: '#5eead4'
    }
  ];

  // Sample doctors data
  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      experience: '15 years',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Pediatrician',
      experience: '12 years',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      specialty: 'Dermatologist',
      experience: '10 years',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1594824704238-8b2d3e7ad58b?w=300&h=300&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'Orthopedist',
      experience: '18 years',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face'
    }
  ];

  return (
    <div className="home-page">
      {/* Enhanced Navigation */}
      <nav className="home-navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <Stethoscope size={28} className="brand-icon" />
            <span className="brand-text">CureQueue</span>
          </div>
          
          <div className="nav-links">
            <button 
              onClick={() => scrollToSection('home')}
              className={activeSection === 'home' ? 'nav-link active' : 'nav-link'}
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className={activeSection === 'about' ? 'nav-link active' : 'nav-link'}
            >
              About Us
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className={activeSection === 'services' ? 'nav-link active' : 'nav-link'}
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('doctors')}
              className={activeSection === 'doctors' ? 'nav-link active' : 'nav-link'}
            >
              Our Doctors
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className={activeSection === 'contact' ? 'nav-link active' : 'nav-link'}
            >
              Contact Us
            </button>
          </div>
          
          <div className="nav-actions">
            <div className="nav-buttons">
              <Link to="/login" className="nav-btn nav-btn-outline">Login</Link>
              <Link to="/register" className="nav-btn nav-btn-primary">Register</Link>
            </div>
            
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-nav-links">
              <button 
                onClick={() => {
                  scrollToSection('home');
                  setMobileMenuOpen(false);
                }}
                className={activeSection === 'home' ? 'mobile-nav-link active' : 'mobile-nav-link'}
              >
                Home
              </button>
              <button 
                onClick={() => {
                  scrollToSection('about');
                  setMobileMenuOpen(false);
                }}
                className={activeSection === 'about' ? 'mobile-nav-link active' : 'mobile-nav-link'}
              >
                About Us
              </button>
              <button 
                onClick={() => {
                  scrollToSection('services');
                  setMobileMenuOpen(false);
                }}
                className={activeSection === 'services' ? 'mobile-nav-link active' : 'mobile-nav-link'}
              >
                Services
              </button>
              <button 
                onClick={() => {
                  scrollToSection('doctors');
                  setMobileMenuOpen(false);
                }}
                className={activeSection === 'doctors' ? 'mobile-nav-link active' : 'mobile-nav-link'}
              >
                Our Doctors
              </button>
              <button 
                onClick={() => {
                  scrollToSection('contact');
                  setMobileMenuOpen(false);
                }}
                className={activeSection === 'contact' ? 'mobile-nav-link active' : 'mobile-nav-link'}
              >
                Contact Us
              </button>
            </div>
            
            <div className="mobile-nav-buttons">
              <Link 
                to="/login" 
                className="mobile-nav-btn mobile-nav-btn-outline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="mobile-nav-btn mobile-nav-btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <motion.div 
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            <motion.div className="hero-text" variants={fadeInLeft}>
              <h1 className="hero-title">
                Smart Healthcare Starts with 
                <span className="text-accent"> CureQueue</span>
              </h1>
              <p className="hero-subtitle">
                Book appointments, track waiting times, and connect with doctors easily. 
                Experience healthcare management like never before.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn-primary">
                  Book Appointment
                  <ChevronRight size={20} />
                </Link>
                <button onClick={() => scrollToSection('about')} className="btn-outline">
                  Learn More
                </button>
              </div>
            </motion.div>
            
            <motion.div className="hero-visual" variants={fadeInRight}>
              <div className="hero-illustration">
                <div className="medical-icons">
                  <Heart className="floating-icon heart" size={40} />
                  <Shield className="floating-icon shield" size={40} />
                  <Stethoscope className="floating-icon stethoscope" size={40} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div className="container">
          <motion.div 
            className="about-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
          >
            <motion.div className="about-text" variants={fadeInLeft}>
              <h2 className="section-title">About CureQueue</h2>
              <p className="about-description">
                CureQueue revolutionizes healthcare management by providing a seamless platform 
                for patients and healthcare providers. Our mission is to eliminate long waiting 
                times, improve patient experience, and make healthcare more accessible through 
                innovative technology.
              </p>
              <div className="about-features">
                <div className="feature-item">
                  <Award size={24} className="feature-icon" />
                  <span>Award-winning platform</span>
                </div>
                <div className="feature-item">
                  <Users size={24} className="feature-icon" />
                  <span>10,000+ satisfied patients</span>
                </div>
                <div className="feature-item">
                  <Stethoscope size={24} className="feature-icon" />
                  <span>500+ healthcare providers</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div className="about-visual" variants={fadeInRight}>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">99%</div>
                  <div className="stat-label">Patient Satisfaction</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support Available</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">&lt; 5min</div>
                  <div className="stat-label">Average Wait Time</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <motion.div 
            className="services-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">
              Comprehensive healthcare solutions designed for your convenience
            </p>
          </motion.div>
          
          <motion.div 
            className="services-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            {services.map((service, index) => (
              <motion.div 
                key={index}
                className="service-card"
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="service-icon" style={{ color: service.color }}>
                  {service.icon}
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <button className="service-link">
                  Learn More <ChevronRight size={16} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Doctors Section */}
      <section id="doctors" className="doctors-section">
        <div className="container">
          <motion.div 
            className="doctors-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="section-title">Our Doctors</h2>
            <p className="section-subtitle">
              Meet our experienced healthcare professionals
            </p>
          </motion.div>
          
          <motion.div 
            className="doctors-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            {doctors.map((doctor, index) => (
              <motion.div 
                key={doctor.id}
                className="doctor-card"
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="doctor-image">
                  <img src={doctor.image} alt={doctor.name} />
                  <div className="doctor-status"></div>
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">{doctor.name}</h3>
                  <p className="doctor-specialty">{doctor.specialty}</p>
                  <p className="doctor-experience">{doctor.experience} experience</p>
                  <div className="doctor-rating">
                    <Star size={16} className="star-filled" />
                    <span>{doctor.rating}</span>
                  </div>
                  <button className="doctor-book-btn">Book Appointment</button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <motion.div 
            className="contact-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="section-title">Contact Us</h2>
            <p className="section-subtitle">
              Get in touch with us for any questions or support
            </p>
          </motion.div>
          
          <motion.div 
            className="contact-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
          >
            <motion.div className="contact-info" variants={fadeInLeft}>
              <h3>Get in Touch</h3>
              <div className="contact-item">
                <Phone size={20} className="contact-icon" />
                <div>
                  <strong>Phone</strong>
                  <p>+91 9741794663</p>
                </div>
              </div>
              <div className="contact-item">
                <Mail size={20} className="contact-icon" />
                <div>
                  <strong>Email</strong>
                  <p>curequeue24x7@gmail.com</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div className="contact-form-wrapper" variants={fadeInRight}>
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary">
                  Send Message
                  <ChevronRight size={20} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo">
                <Stethoscope size={28} />
                <span>CureQueue</span>
              </div>
              <p>Making healthcare accessible and efficient for everyone.</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Quick Links</h4>
                <ul>
                  <li><button onClick={() => scrollToSection('home')}>Home</button></li>
                  <li><button onClick={() => scrollToSection('about')}>About</button></li>
                  <li><button onClick={() => scrollToSection('services')}>Services</button></li>
                  <li><button onClick={() => scrollToSection('doctors')}>Doctors</button></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Services</h4>
                <ul>
                  <li><Link to="/register">Book Appointment</Link></li>
                  <li><a href="#services">Queue Tracking</a></li>
                  <li><a href="#services">Home Visits</a></li>
                  <li><a href="#services">Health Assistant</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Support</h4>
                <ul>
                  <li><button onClick={() => scrollToSection('contact')}>Contact Us</button></li>
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#privacy">Privacy Policy</a></li>
                  <li><a href="#terms">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 CureQueue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;