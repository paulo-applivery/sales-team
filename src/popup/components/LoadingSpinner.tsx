export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-secondary-300 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-secondary-600">Generating content...</p>
      </div>
    </div>
  );
}
