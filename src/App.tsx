import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Library from './pages/Library';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/biblioteca" element={<Library />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
