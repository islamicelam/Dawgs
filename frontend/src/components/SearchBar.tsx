import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { searchTasks } from '../api/search';
import { useDebounce } from '../hooks/useDebounce';
import PriorityBadge from './common/PriorityBadge';
import type { SearchResult } from '../types';
import HighlightText from './common/HighlightText';

const SearchBar = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query.trim(), 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const res = await searchTasks(debouncedQuery);
        if (!cancelled) setResults(res.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    navigate(
      `/boards/${result.boardId}?taskId=${result.id}&projectId=${result.projectId}`,
    );
  };

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <MagnifyingGlass
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              e.currentTarget.blur();
            }
          }}
          placeholder="Search tasks..."
          className="w-full bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm rounded-md pl-8 pr-3 py-1.5 border border-transparent focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-2 focus:ring-indigo-500/25 transition-colors"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-neutral-900 rounded-lg shadow-xl shadow-black/10 dark:shadow-black/40 border border-neutral-200 dark:border-neutral-800 max-h-96 overflow-y-auto z-50 animate-modal-in">
          {loading && (
            <div className="px-4 py-3 text-sm text-neutral-400 dark:text-neutral-500">
              Searching...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-neutral-400 dark:text-neutral-500">
              No scent. Try another word.
            </div>
          )}

          {!loading &&
            results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                    <HighlightText
                      fragment={result.highlight?.title?.[0]}
                      fallback={result.title}
                    />
                  </p>
                  <PriorityBadge priority={result.priority} />
                </div>
                {(result.highlight?.description?.[0] ??
                  result.description) && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                    <HighlightText
                      fragment={result.highlight?.description?.[0]}
                      fallback={result.description}
                    />
                  </p>
                )}
                {result.status && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    {result.status}
                  </p>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
