import { useParams } from "react-router-dom";
import ItineraryBuilder from "../features/itinerary/ItineraryBuilder";

export default function BuilderPage() {
  const { tripId } = useParams();
  return <ItineraryBuilder tripId={Number(tripId)} />;
}
