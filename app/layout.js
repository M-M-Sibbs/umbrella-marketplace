// app/layout.js
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export const metadata = {
  title: 'Umbrella Marketplace — AI-powered peace jobs for Zimbabwe',
  description: 'Find peace jobs, get paired with the perfect AI agent, and deliver great work. Umbrella Marketplace connects Zimbabwe\'s workforce with employers and AI.',
  icons: {
    icon: '/img/logo.jpg',
    shortcut: '/img/logo.jpg',
    apple: '/img/logo.jpg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
