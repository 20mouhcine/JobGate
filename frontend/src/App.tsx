import { Route, Routes } from "react-router-dom";


import EventsPage from "@/pages/events";
import EventDetailsPage from "@/pages/eventDetails";
import EventsRegister from "./pages/talent/EventsRegister";
function App() {
  
  return (
    <Routes>
      <Route element={<EventsPage />} path="/events" />
      <Route element={<EventDetailsPage />} path="/events/:id" />
      <Route element={<EventsRegister />} path="/events/register/:eventId" />
    </Routes>
  );
}

export default App;
