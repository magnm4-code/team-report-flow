import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSettings } from '@/lib/storage';
import ncgrLogo from '@/assets/ncgr-logo.png';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLayoutOrder } from '@/hooks/useLayoutOrder';

interface HeaderProps {
  showHomeButton?: boolean;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

type HeaderItemId = 'logo' | 'title' | 'darkmode';

interface SortableHeaderItemProps {
  id: HeaderItemId;
  children: React.ReactNode;
}

const SortableHeaderItem = ({ id, children }: SortableHeaderItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group flex items-center"
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute -top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 rounded bg-white/20 hover:bg-white/30 z-10"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-3 h-3 text-primary-foreground" />
      </button>
      {children}
    </div>
  );
};

const Header = ({ showHomeButton = false, title, subtitle, children }: HeaderProps) => {
  const [isDark, setIsDark] = useState(false);
  const [settings, setSettings] = useState({ headerTitle: 'التقرير الأسبوعي', headerSubtitle: 'نظام إدارة التقارير الأسبوعية للفرق' });
  const [headerOrder, setHeaderOrder] = useLayoutOrder<HeaderItemId>('header-layout-order', ['logo', 'title', 'darkmode']);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
    setSettings(getSettings());
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const displayTitle = title || settings.headerTitle;
  const displaySubtitle = subtitle || settings.headerSubtitle;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = headerOrder.indexOf(active.id as HeaderItemId);
      const newIndex = headerOrder.indexOf(over.id as HeaderItemId);
      setHeaderOrder(arrayMove(headerOrder, oldIndex, newIndex));
    }
  };

  const renderHeaderItem = (id: HeaderItemId) => {
    switch (id) {
      case 'logo':
        return (
          <Link to="/" className="flex-shrink-0">
            <img 
              src={ncgrLogo} 
              alt="NCGR Logo" 
              className="h-12 md:h-16 w-auto bg-white/90 rounded-lg p-1"
            />
          </Link>
        );
      case 'title':
        return (
          <div className="text-center md:text-right">
            <h1 className="text-xl md:text-2xl font-bold">{displayTitle}</h1>
            {displaySubtitle && (
              <p className="text-sm opacity-80">{displaySubtitle}</p>
            )}
          </div>
        );
      case 'darkmode':
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={toggleDarkMode}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            {children}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="gradient-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={headerOrder} strategy={horizontalListSortingStrategy}>
            <div className="flex items-center justify-between gap-4">
              {headerOrder.map((id) => (
                <SortableHeaderItem key={id} id={id}>
                  {renderHeaderItem(id)}
                </SortableHeaderItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </header>
  );
};

export default Header;
