import { Routes, Route } from "react-router-dom"
import { ProtectedRoute } from './components/protected.route';
import { PublicRoute } from './components/public.route';
import LoginPage from './pages/login';
import './App.css';
import CasesPage from './pages/Cases';

const App = () => (
      <div>
            <Routes>
                  <Route exact path='/' element={<PublicRoute />}>
                        <Route exact path='/' element={<LoginPage></LoginPage>} />
                  </Route>
                  <Route exact path='/dashboard' element={<ProtectedRoute />}>
                        <Route exact path='/dashboard' element={<CasesPage></CasesPage>} />
                  </Route>
            </Routes>
      </div>
)

export default App