interface LanguageToggleProps {
  language: 'en' | 'multi';
  onLanguageChange: (language: 'en' | 'multi') => void;
  disabled?: boolean;
}

export function LanguageToggle({
  language,
  onLanguageChange,
  disabled = false,
}: LanguageToggleProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Transcription Language
      </h3>
      <div className="flex space-x-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onLanguageChange('en')}
          className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
            language === 'en'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          English
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onLanguageChange('multi')}
          className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
            language === 'multi'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Multi-language
        </button>
      </div>
    </div>
  );
}
