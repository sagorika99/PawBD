import './globals.css';
import { LangProvider } from '@/components/LangProvider';
import Nav from '@/components/Nav';

export const metadata = {
  title: 'PawBD – Adopt & rescue cats and dogs in Bangladesh',
  description: 'Find cats and dogs to adopt, request a pet, and report animals in danger on a map.',
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <Nav />
          <main>{children}</main>
        </LangProvider>
      </body>
    </html>
  );
}
