interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

export default function Tabs({ items, value, onChange, ariaLabel }: TabsProps) {
  return (
    <div className="ui-tabs" role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          className={`ui-tabs__tab${value === item.id ? ' is-active' : ''}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
          {typeof item.count === 'number' ? <span>{item.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
