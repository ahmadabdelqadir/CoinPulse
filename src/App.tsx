import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Navbar, SelectionModal } from './components';
import { Home, Reports, AIRecommendation, About } from './pages';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-crypto-dark">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai" element={<AIRecommendation />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <SelectionModal />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
