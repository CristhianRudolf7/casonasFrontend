export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">Casonas</h1>
          <p className="text-gray-500 mt-2">Análisis de restauración con IA</p>
        </div>
        {children}
      </div>
    </div>
  );
}
