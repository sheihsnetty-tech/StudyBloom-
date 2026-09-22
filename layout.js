import "./globals.css";

export const metadata = {
  title: "StudyBloom",
  description: "Plan smarter • Study better • Achieve more"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}