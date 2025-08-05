import { Card, CardHeader, CardBody } from "@heroui/card";
import {Image} from "@heroui/image";
import { Link } from "react-router-dom";
import testImage from "../../public/téléchargement.png"

export default function EventCard({ event }: { event?: any }) {
  const start_date = new Date(event?.start_date);
  const formattedDate = start_date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const start_day = start_date.getDate()
  const month = start_date.toLocaleString("fr-FR", { month: "long" });


  const end_date = new Date(event?.end_date);
  const formattedEndDate = end_date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const end_day = end_date.getDate();


  return (
    <Card className="flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start space-y-1">
      </CardHeader>
      <Image src={testImage}/>

      <CardBody className="px-4 flex-1 flex flex-col justify-between">
        <h5 className=" uppercase font-bold">
          {event?.title || "title"}
        </h5>
        <small className="text-default-500">
          Du {start_day} au {end_day} {month} {end_date.getFullYear()}
        </small>
        <small className="text-default-500">
          {event?.location || "Casablanca"}
        </small>
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
