export const metadata = {
  title: "DealsInKampala Bot",
  description: "Telegram bot webhook server",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
