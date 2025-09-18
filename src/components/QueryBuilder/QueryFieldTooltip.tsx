import * as React from 'react';

export interface QueryFieldTooltipProps {
  children: React.ReactElement;
  title?: string;
  displayText?: string;
  filterSummary?: string;
  filterLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const QueryFieldTooltip: React.FC<QueryFieldTooltipProps> = ({
  children,
  title,
  displayText,
  filterSummary,
  filterLabel,
  disabled = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const targetRef = React.useRef<HTMLElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleMouseEnter = React.useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    clearTimeout(timeoutRef.current);

    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 300);
  }, [disabled]);

  const handleMouseLeave = React.useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    if (children.props.onClick) {
      children.props.onClick(e);
    }
  }, [children.props]);

  if (!title && !displayText && !filterSummary) {
    return children;
  }

  const tooltipContent = (
    <div className={`query-field-tooltip ${className}`}>
      <div className="query-field-tooltip__content">
        {(title || displayText) && (
          <div className="query-field-tooltip__header">
            <span className="query-field-tooltip__title">
              {title || displayText}
            </span>
          </div>
        )}

        {filterSummary && (
          <div className="query-field-tooltip__filters">
            <div className="query-field-tooltip__filter-label">
              {filterLabel}:
            </div>
            <div className="query-field-tooltip__filter-content">
              {filterSummary}
            </div>
          </div>
        )}
      </div>

      <div className="query-field-tooltip__arrow" />
    </div>
  );

  const childElement = React.cloneElement(children, {
    ref: targetRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
  });

  return (
    <>
      {childElement}
    </>
  );
};
