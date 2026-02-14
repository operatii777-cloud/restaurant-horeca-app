import { useTranslation } from '@/i18n/I18nContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LanguageSwitcher = ({ size = 'md' }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useTranslation();

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <div className="flex items-center gap-2">
      <Globe size={iconSizes[size]} className="text-gray-600 dark:text-gray-400" />
      <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
        <button
          onClick={() => setLanguage('ro')}
          className={`
            ${sizeClasses[size]}
            font-medium transition-colors
            ${language === 'ro'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
          `}
          title="Română"
        >
          RO
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`
            ${sizeClasses[size]}
            font-medium transition-colors border-l border-gray-300 dark:border-gray-600
            ${language === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
          `}
          title="English"
        >
          EN
        </button>
      </div>
    </div>
  );
};

// Default export for backwards compatibility
export default LanguageSwitcher;

