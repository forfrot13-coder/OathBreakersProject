export default function Loading({ message = 'درحال بارگذاری...' }: { message?: string }) {
  return (
    <div className="loading-container flex flex-col items-center justify-center p-8">
      <div className="spinner mb-4" />
      <p className="text-secondary">{message}</p>
    </div>
  );
}
