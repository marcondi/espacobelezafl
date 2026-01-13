import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthSelectorProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
}

export default function MonthSelector({ currentDate, onPrevious, onNext }: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" size="icon" onClick={onPrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h2 className="text-2xl font-semibold capitalize">
        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
      </h2>
      <Button variant="outline" size="icon" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
