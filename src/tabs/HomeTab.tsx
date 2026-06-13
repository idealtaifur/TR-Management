import { Balance } from "../components/Balance";
import { StatsGrid } from "../components/StatsGrid";
import { Category } from "../components/Category";
import { GoalsTips } from "../components/GoalsTips";
import { BottomNav } from "../components/BottomNav";
import { useStore } from "../store/useStore";

export function HomeTab({ setTab, currentTab }: { setTab: (t: string) => void, currentTab: string }) {
  const { profile } = useStore();

  return (
    <div className="space-y-2 pb-0 flex flex-col pt-1">
      <Balance />
      <StatsGrid />
      <Category />
      <GoalsTips />
      <div className="pt-2">
        <BottomNav currentTab={currentTab} setTab={setTab} />
      </div>
    </div>
  );
}
