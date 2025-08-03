import { Card, CardHeader, CardBody } from "@heroui/card";
import { Link } from "react-router-dom";

export default function EventCard({ event }: { event?: any }) {
  const date = new Date(event?.date);
  const formattedDate = date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <Card className="py-4 min-w-auto">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <h4 className="text-tiny uppercase font-bold">
          {event?.title || "title"}
        </h4>
        <small className="text-default-500">
          {formattedDate || "20/12/2025"}
        </small>
        <small className="text-default-500">
          {event?.location || "Casablanca"}
        </small>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <h4 className="font-sans text-gray-600 text-md mb-2">
          {event?.description || "description description description"}
        </h4>
        <p>{event?.is_timeSlot_enabled}</p>
        <Link to={`/events/${event?.id}`}>
          <span className="underline flex justify-end text-blue-500 font-light">
            Voir Plus {">"}
          </span>
        </Link>
      </CardBody>
    </Card>
  );
}
