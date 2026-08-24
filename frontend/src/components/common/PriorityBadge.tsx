import type { TaskPriority } from '../../types';
import { PRIORITY_DOT, PRIORITY_LABEL, PRIORITY_TEXT } from '../../constants/task';

const PriorityBadge = ({
  priority,
  className = '',
}: {
  priority: TaskPriority;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs shrink-0 ${PRIORITY_TEXT[priority]} ${className}`}
  >
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[priority]}`} />
    {PRIORITY_LABEL[priority]}
  </span>
);

export default PriorityBadge;
