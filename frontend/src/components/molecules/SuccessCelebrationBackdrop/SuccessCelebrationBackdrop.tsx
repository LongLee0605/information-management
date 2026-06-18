import { ConfettiCelebration } from '@/components/molecules/ConfettiCelebration';
const CELEBRATION_COLORS = ['#3b82f6', '#16a34a', '#f59e0b', '#ec4899', '#8b5cf6'];
interface SuccessCelebrationBackdropProps {
    active?: boolean;
}
export function SuccessCelebrationBackdrop({ active = true }: SuccessCelebrationBackdropProps) {
    return (<>
      <ConfettiCelebration active={active}/>
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        {Array.from({ length: 24 }).map((_, index) => (<span key={index} className="absolute h-2 w-2 rounded-full" style={{
                top: `${(index * 17) % 100}%`,
                left: `${(index * 29) % 100}%`,
                backgroundColor: CELEBRATION_COLORS[index % CELEBRATION_COLORS.length],
            }} aria-hidden="true"/>))}
      </div>
    </>);
}
