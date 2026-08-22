import { useParams } from "react-router-dom";
import Budget from "../features/budget/Budget";

export default function BudgetPage() {
  const { tripId } = useParams();
  return <Budget tripId={Number(tripId)} />;
}
