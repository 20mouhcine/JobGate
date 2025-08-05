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
    <Card className="flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start space-y-1">
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

      <CardBody className="px-4 flex-1 flex flex-col justify-between">
        <div className="text-gray-600 text-md line-clamp-3"
        dangerouslySetInnerHTML={{ __html: event?.description || "description description description" }}
        >
        </div>

        <div className="flex justify-end">
          <Link to={`/events/${event?.id}`}>
            <span className="underline text-blue-500 font-light">
              Voir Plus &gt;
            </span>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
