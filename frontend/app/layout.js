import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'Women Skill Portal',
  description: 'Women Skill Development & Employment Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
