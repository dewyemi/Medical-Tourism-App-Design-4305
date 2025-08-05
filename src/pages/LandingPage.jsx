import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiGlobe, 
  FiHeart, 
  FiShield, 
  FiStar, 
  FiUsers, 
  FiMapPin,
  FiPhone,
  FiMail,
  FiArrowRight,
  FiCheckCircle,
  FiPlay,
  FiDollarSign,
  FiClock,
  FiAward
} from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    treatmentInterest: '',
    medicalCondition: '',
    preferredDestination: '',
    timeframe: '',
    budgetRange: '',
    additionalInfo: ''
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Submit inquiry to patient journey system
    console.log('Inquiry submitted:', formData);
    // Navigate to signup or login with pre-filled data
    navigate('/signup', { state: { inquiryData: formData } });
  };

  const services = [
    {
      icon: FiHeart,
      title: 'Premium Medical Care',
      description: 'Access to world-class healthcare facilities and internationally certified medical professionals.',
      features: ['Board-certified specialists', 'Latest medical technology', 'Personalized treatment plans']
    },
    {
      icon: FiGlobe,
      title: 'Global Destinations',
      description: 'Carefully selected medical tourism destinations offering exceptional care and cultural experiences.',
      features: ['Turkey - Istanbul & Antalya', 'Thailand - Bangkok & Phuket', 'India - Delhi & Mumbai', 'UAE - Dubai & Abu Dhabi']
    },
    {
      icon: FiShield,
      title: 'Comprehensive Support',
      description: 'End-to-end support from initial consultation to post-treatment follow-up care.',
      features: ['24/7 multilingual support', 'Travel coordination', 'Accommodation assistance', 'Emergency medical coverage']
    },
    {
      icon: FiDollarSign,
      title: 'Transparent Pricing',
      description: 'Upfront pricing with no hidden costs. Save up to 70% compared to home country prices.',
      features: ['Detailed cost breakdowns', 'Flexible payment plans', 'Multiple payment methods', 'Insurance coordination']
    }
  ];

  const treatments = [
    { name: 'Cosmetic Surgery', savings: '60-75%', duration: '7-14 days' },
    { name: 'Dental Procedures', savings: '50-70%', duration: '3-7 days' },
    { name: 'Orthopedic Surgery', savings: '65-80%', duration: '14-21 days' },
    { name: 'Cardiac Procedures', savings: '70-85%', duration: '10-21 days' },
    { name: 'Eye Surgery (LASIK)', savings: '60-75%', duration: '2-5 days' },
    { name: 'Fertility Treatments', savings: '50-65%', duration: '14-28 days' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      country: 'USA',
      treatment: 'Cosmetic Surgery',
      rating: 5,
      text: 'EmirAfrik made my medical journey seamless. From the initial consultation to post-surgery care, everything was perfectly coordinated.'
    },
    {
      name: 'Ahmed Hassan',
      country: 'UK',
      treatment: 'Dental Implants',
      rating: 5,
      text: 'Excellent service and significant cost savings. The quality of care exceeded my expectations, and the support team was amazing.'
    },
    {
      name: 'Maria Rodriguez',
      country: 'Spain',
      treatment: 'Orthopedic Surgery',
      rating: 5,
      text: 'Professional, caring, and efficient. EmirAfrik handled everything from travel to accommodation. Highly recommend!'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <FiGlobe className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">EmirAfrik</span>
              </motion.div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
              <a href="#treatments" className="text-gray-700 hover:text-blue-600 transition-colors">Treatments</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">Testimonials</a>
              <a href="#inquiry" className="text-gray-700 hover:text-blue-600 transition-colors">Get Started</a>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Your Journey to{' '}
                <span className="text-yellow-400">Better Health</span>{' '}
                Starts Here
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Experience world-class medical care at affordable prices with EmirAfrik's comprehensive medical tourism services. From consultation to recovery, we're with you every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => document.getElementById('inquiry').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Your Journey <FiArrowRight className="ml-2" />
                </motion.button>
                <motion.button
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlay className="mr-2" /> Watch Our Story
                </motion.button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-6">Why Choose EmirAfrik?</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FiCheckCircle className="text-green-400 mr-3" />
                    <span>Save 50-85% on medical costs</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheckCircle className="text-green-400 mr-3" />
                    <span>JCI-accredited hospitals</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheckCircle className="text-green-400 mr-3" />
                    <span>24/7 multilingual support</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheckCircle className="text-green-400 mr-3" />
                    <span>Complete travel coordination</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Comprehensive Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From medical expertise to travel logistics, we provide end-to-end support for your medical tourism journey.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <service.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section id="treatments" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Treatments & Savings</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover significant cost savings without compromising on quality of care.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {treatments.map((treatment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">{treatment.name}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Potential Savings:</span>
                  <span className="text-lg font-bold text-green-600">{treatment.savings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium text-gray-900">{treatment.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from patients who trusted EmirAfrik with their medical journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.country} • {testimonial.treatment}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry" className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Start Your Medical Journey Today</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Get a personalized consultation and treatment plan tailored to your needs and budget.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Treatment of Interest</label>
                <select
                  name="treatmentInterest"
                  value={formData.treatmentInterest}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Treatment</option>
                  <option value="cosmetic">Cosmetic Surgery</option>
                  <option value="dental">Dental Procedures</option>
                  <option value="orthopedic">Orthopedic Surgery</option>
                  <option value="cardiac">Cardiac Procedures</option>
                  <option value="eye">Eye Surgery</option>
                  <option value="fertility">Fertility Treatments</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Destination</label>
                <select
                  name="preferredDestination"
                  value={formData.preferredDestination}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Destination</option>
                  <option value="turkey">Turkey</option>
                  <option value="thailand">Thailand</option>
                  <option value="india">India</option>
                  <option value="uae">UAE</option>
                  <option value="no_preference">No Preference</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                <select
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Timeframe</option>
                  <option value="asap">ASAP</option>
                  <option value="1-3_months">1-3 Months</option>
                  <option value="3-6_months">3-6 Months</option>
                  <option value="6-12_months">6-12 Months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Condition (Brief Description)</label>
                <textarea
                  name="medicalCondition"
                  value={formData.medicalCondition}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide a brief description of your medical condition or treatment needs..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information or specific questions..."
                />
              </div>
              <div className="md:col-span-2">
                <motion.button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit Inquiry <FiArrowRight className="ml-2" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FiGlobe className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">EmirAfrik</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for world-class medical tourism experiences.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiMail className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiPhone className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Medical Consultations</li>
                <li>Treatment Planning</li>
                <li>Travel Coordination</li>
                <li>Accommodation</li>
                <li>Recovery Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Destinations</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Turkey</li>
                <li>Thailand</li>
                <li>India</li>
                <li>UAE</li>
                <li>Singapore</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <FiMail className="w-4 h-4 mr-2" />
                  <span>info@emirafrik.com</span>
                </div>
                <div className="flex items-center">
                  <FiPhone className="w-4 h-4 mr-2" />
                  <span>+971 50 123 4567</span>
                </div>
                <div className="flex items-center">
                  <FiMapPin className="w-4 h-4 mr-2" />
                  <span>Dubai, UAE</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EmirAfrik. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;