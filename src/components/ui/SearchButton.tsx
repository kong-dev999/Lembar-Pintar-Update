import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import Input from './Input';

interface SearchButtonProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
  defaultValue?: string;
}

const SearchButton = React.forwardRef<HTMLDivElement, SearchButtonProps>(
  (
    { placeholder = 'Search...', onSearch, className, defaultValue = '' },
    ref
  ) => {
    const [value, setValue] = React.useState(defaultValue);
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) onSearch?.(value);
    };

    const handleClear = () => {
      setValue('');
      inputRef.current?.focus();
    };

    const active = Boolean(isFocused || value);

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full max-w-md transition-all duration-300',
          className
        )}
      >
        <form onSubmit={handleSubmit} className="relative">
          <div
            className={cn(
              'relative flex items-center rounded-lg border border-input bg-background shadow-sm transition-all duration-200',
              // when active, make border white and slightly thicker so it's visible
              active &&
                'border-2 border-white shadow-[0_0_18px_rgba(255,255,255,0.95),0_0_36px_rgba(124,58,237,0.55)]'
            )}
            style={{
              // ensure smooth glow transition
              transitionProperty: 'box-shadow, border-color',
              transitionDuration: '200ms',
            }}
          >
            <div className="pl-3 pr-2 text-white">
              <Search className="h-4 w-4" />
            </div>
            <Input
              ref={inputRef}
              type="search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="border-0 shadow-none focus-visible:ring-0 pr-10"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  'absolute right-2 p-1 rounded-full hover:bg-accent transition-colors focus:outline-none',
                  active ? 'text-white' : ''
                )}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }
);
SearchButton.displayName = 'SearchButton';
export default SearchButton;
