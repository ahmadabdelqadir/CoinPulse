import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setSearchQuery } from '../../store/slices/coinsSlice';
import styles from './Navbar.module.css';

const Navbar = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.coins.searchQuery);
  const selectedCoins = useAppSelector((state) => state.selectedCoins.coins);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/reports', label: 'Real-Time Reports' },
    { path: '/ai', label: 'AI Recommendation' },
    { path: '/about', label: 'About' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navContent}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={styles.logoIcon}
            >
              <span>CP</span>
            </motion.div>
            <span className={styles.logoText}>CoinPulse</span>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.navLinks}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.navLink} ${
                  location.pathname === link.path ? styles.navLinkActive : ''
                }`}
              >
                {link.label}
                {(link.path === '/reports' || link.path === '/ai') &&
                  selectedCoins.length > 0 && (
                    <span className={styles.badge}>{selectedCoins.length}</span>
                  )}
              </Link>
            ))}
          </div>

          {/* Search Input - Only visible on Home page */}
          {location.pathname === '/' && (
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <svg
                  className={styles.searchIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search coins..."
                  className={styles.searchInput}
                />
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={styles.mobileMenuBtn}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.mobileMenu}
          >
            {/* Mobile Search */}
            {location.pathname === '/' && (
              <div className={styles.mobileSearch}>
                <div className={styles.searchWrapper}>
                  <svg
                    className={styles.searchIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search coins..."
                    className={styles.mobileSearchInput}
                  />
                </div>
              </div>
            )}

            <div className={styles.mobileNavLinks}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${styles.mobileNavLink} ${
                    location.pathname === link.path ? styles.mobileNavLinkActive : ''
                  }`}
                >
                  {link.label}
                  {(link.path === '/reports' || link.path === '/ai') &&
                    selectedCoins.length > 0 && (
                      <span className={styles.badge}>{selectedCoins.length}</span>
                    )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
