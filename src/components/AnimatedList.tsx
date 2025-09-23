import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import './AnimatedList.css';

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  isSelected: boolean;
  onClick?: () => void;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, delay = 0, index, isSelected, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onClick={onClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="animated-item"
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps {
  items?: string[];
  onItemSelect?: (item: string, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  items = [
    'Item 1',
    'Item 2',
    'Item 3',
    'Item 4',
    'Item 5',
    'Item 6',
    'Item 7',
    'Item 8',
    'Item 9',
    'Item 10',
    'Item 11',
    'Item 12',
    'Item 13',
    'Item 14',
    'Item 15'
  ],
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  selectedIndex: controlledSelectedIndex,
  onSelectedIndexChange,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number>(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);

  useEffect(() => {
    if (controlledSelectedIndex !== undefined) {
      setInternalSelectedIndex(controlledSelectedIndex);
    }
  }, [controlledSelectedIndex]);

  useEffect(() => {
    if (controlledSelectedIndex === undefined) {
      if (items.length === 0) {
        if (internalSelectedIndex !== -1) {
          setInternalSelectedIndex(-1);
        }
        return;
      }

      const maxIndex = items.length - 1;
      if (internalSelectedIndex < 0 && initialSelectedIndex >= 0 && initialSelectedIndex <= maxIndex) {
        setInternalSelectedIndex(initialSelectedIndex);
      } else if (internalSelectedIndex > maxIndex) {
        setInternalSelectedIndex(maxIndex);
      }
    }
  }, [controlledSelectedIndex, initialSelectedIndex, internalSelectedIndex, items.length]);

  const resolvedSelectedIndex = controlledSelectedIndex ?? internalSelectedIndex;

  const updateSelection = useCallback(
    (index: number, notifySelect = false) => {
      if (items.length === 0) {
        if (controlledSelectedIndex === undefined && internalSelectedIndex !== -1) {
          setInternalSelectedIndex(-1);
        }
        if (controlledSelectedIndex !== undefined) {
          onSelectedIndexChange?.(-1);
        }
        return;
      }

      if (index < 0) {
        if (controlledSelectedIndex === undefined) {
          if (internalSelectedIndex !== -1) {
            setInternalSelectedIndex(-1);
          }
        }
        onSelectedIndexChange?.(-1);
        return;
      }

      const clamped = Math.min(index, items.length - 1);
      const item = items[clamped];

      if (controlledSelectedIndex === undefined) {
        if (internalSelectedIndex !== clamped) {
          setInternalSelectedIndex(clamped);
        }
        onSelectedIndexChange?.(clamped);
      } else if (clamped !== controlledSelectedIndex) {
        onSelectedIndexChange?.(clamped);
      }

      if (notifySelect && item !== undefined) {
        onItemSelect?.(item, clamped);
      }
    },
    [controlledSelectedIndex, internalSelectedIndex, items, onItemSelect, onSelectedIndexChange]
  );

  useEffect(() => {
    if (resolvedSelectedIndex >= items.length && items.length > 0) {
      updateSelection(items.length - 1);
    }
  }, [items.length, resolvedSelectedIndex, updateSelection]);

  const handleScroll = useCallback((target: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, []);

  const onContainerScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      handleScroll(event.target as HTMLDivElement);
    },
    [handleScroll]
  );

  useEffect(() => {
    const container = listRef.current;
    if (container) {
      handleScroll(container);
    }
  }, [items.length, handleScroll]);

  useEffect(() => {
    if (!enableArrowNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (items.length === 0) return;

      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        const current = resolvedSelectedIndex >= 0 ? resolvedSelectedIndex : -1;
        const nextIndex = current < items.length - 1 ? current + 1 : items.length - 1;
        updateSelection(nextIndex, true);
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        const current = resolvedSelectedIndex >= 0 ? resolvedSelectedIndex : items.length;
        const nextIndex = current > 0 ? current - 1 : 0;
        updateSelection(nextIndex, true);
      } else if (e.key === 'Enter') {
        if (resolvedSelectedIndex >= 0 && resolvedSelectedIndex < items.length) {
          e.preventDefault();
          const item = items[resolvedSelectedIndex];
          if (item !== undefined) {
            onItemSelect?.(item, resolvedSelectedIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableArrowNavigation, items, onItemSelect, resolvedSelectedIndex, updateSelection]);

  useEffect(() => {
    if (!keyboardNav || resolvedSelectedIndex < 0 || !listRef.current) {
      return;
    }

    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${resolvedSelectedIndex}"]`) as HTMLElement | null;
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;

      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth',
        });
      }
    }

    setKeyboardNav(false);
  }, [keyboardNav, resolvedSelectedIndex]);

  return (
    <div className={`scroll-list-container ${className}`}>
      <div
        ref={listRef}
        className={`scroll-list ${!displayScrollbar ? 'no-scrollbar' : ''}`}
        onScroll={onContainerScroll}
        role="list"
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={`${item}-${index}`}
            delay={0.08}
            index={index}
            isSelected={resolvedSelectedIndex === index}
            onClick={() => updateSelection(index, true)}
          >
            <div className={`item ${resolvedSelectedIndex === index ? 'selected' : ''} ${itemClassName}`}>
              <p className="item-text">{item}</p>
            </div>
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div className="top-gradient" style={{ opacity: topGradientOpacity }}></div>
          <div className="bottom-gradient" style={{ opacity: bottomGradientOpacity }}></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;
