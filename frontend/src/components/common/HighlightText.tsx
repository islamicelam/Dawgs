// Renders an Elasticsearch highlight fragment, treating only <em>/</em> as
// markup and rendering everything else as plain (React-escaped) text.
const HighlightText = ({
  fragment,
  fallback,
}: {
  fragment?: string;
  fallback?: string;
}) => {
  const text = fragment ?? fallback ?? '';
  if (!text) return null;

  const parts = text.split(/(<em>|<\/em>)/);
  let highlighting = false;
  const nodes: React.ReactNode[] = [];

  parts.forEach((part, i) => {
    if (part === '<em>') {
      highlighting = true;
      return;
    }
    if (part === '</em>') {
      highlighting = false;
      return;
    }
    if (!part) return;
    nodes.push(
      highlighting ? (
        <mark key={i} className="bg-amber-200 text-slate-900 rounded-sm">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  });

  return <>{nodes}</>;
};

export default HighlightText;
