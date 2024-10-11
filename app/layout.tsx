import './globals.css';  
import { Lato  } from 'next/font/google'
 
// If loading a variable font, you don't need to specify the font weight
const lato = Lato ({
  weight: ['400' , '700'],
  subsets: ['latin'],
  
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Trademark Search</title>
      </head>
      <body className={lato.className}>
        {children}
      </body>
    </html>
  );
}
