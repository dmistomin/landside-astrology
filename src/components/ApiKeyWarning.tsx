export function ApiKeyWarning() {
  return (
    <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
      <p className="text-sm text-amber-800">
        Please set your Deepgram API key in the .env file
        (VITE_DEEPGRAM_API_KEY)
      </p>
    </div>
  );
}
