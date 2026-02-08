import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRouteWrapper from './components/Layout/ProtectedRouteWrapper';
import BrandAmbassador from './pages/BrandAmbassador';
import LoginPage from './pages/LoginPage';

import Dashboard from './pages/Dashboard';
import LeadDashboard from './components/CRM/LeadDashboard';
import LeadDetails from './components/CRM/LeadDetails';


import PhotoshootStudio from './pages/PhotoshootStudio';
import AIChatBot from './pages/AIChatBot';
import WordPressFormGenerator from './pages/WordPressFormGenerator';
import EmailMarketing from './pages/EmailMarketing';
import ImagePromptBuilder from './pages/ImagePromptBuilder';
import SmartArticles from './pages/SmartArticles';
import WebPresentation from './pages/WebPresentation';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRouteWrapper />}>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="crm" element={<LeadDashboard />} />
                        <Route path="crm/:id" element={<LeadDetails />} />

                        <Route path="smart-articles" element={<SmartArticles />} />
                        <Route path="photoshoot" element={<PhotoshootStudio />} />
                        <Route path="chatbot" element={<AIChatBot />} />
                        <Route path="wp-form" element={<WordPressFormGenerator />} />
                        <Route path="email" element={<EmailMarketing />} />
                        <Route path="image-prompts" element={<ImagePromptBuilder />} />
                        <Route path="brand-ambassador" element={<BrandAmbassador />} />
                    </Route>
                    {/* Standalone Protected Route for Full Screen Presentation */}
                    <Route path="/presentation" element={<WebPresentation />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
