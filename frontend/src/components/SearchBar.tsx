import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTasks } from '../api/search';
import { useDebounce } from '../hooks/useDebounce';
import { PRIORITY_BADGE, PRIORITY_LABEL } from '../constants/task';
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
    navigate(`/boards/${result.boardId}?taskId=${result.id}&projectId=${result.projectId}`);
  };

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
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
        className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-slate-400"
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 max-h-96 overflow-y-auto z-50">
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-400">Searching...</div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-400">No results</div>
          )}

          {!loading &&
            results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    <HighlightText
                      fragment={result.highlight?.title?.[0]}
                      fallback={result.title}
                    />
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_BADGE[result.priority]}`}
                  >
                    {PRIORITY_LABEL[result.priority]}
                  </span>
                </div>
                {(result.highlight?.description?.[0] ?? result.description) && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    <HighlightText
                      fragment={result.highlight?.description?.[0]}
                      fallback={result.description}
                    />
                  </p>
                )}
                {result.status && (
                  <p className="text-xs text-slate-400 mt-1">{result.status}</p>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
