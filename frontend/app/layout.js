import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'EmpowerHer | Women Skill Development & Employment Portal',
  description: 'National Women in Workforce Initiative. Gain in-demand tech skills, earn verified credentials, and secure high-growth career opportunities.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-sans text-body-md text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-primary">
        <Navbar />
        <div className="flex-1 w-full pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
