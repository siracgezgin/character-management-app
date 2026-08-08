import type { Status } from '@/gql/graphql';

const STATUS_STYLES: Record<Status, { label: string; className: string }> = {
  ALIVE: {
    label: 'Alive',
    className: 'bg-status-alive-bg text-status-alive',
  },
  DEAD: {
    label: 'Dead',
    className: 'bg-status-dead-bg text-status-dead',
  },
  UNKNOWN: {
    label: 'Unknown',
    className: 'bg-status-unknown-bg text-status-unknown',
  },
};

/**
 * The dot is decorative; the status is always spelled out in text beside it so
 * the meaning does not depend on colour vision.
 */
export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-current opacity-80"
      />
      <span className="sr-only">Status: </span>
      {label}
    </span>
  );
}
