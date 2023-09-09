import "./styles.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className="dark">{children}</body>
    </html>
  );
}
