import { Route, Routes } from "react-router-dom";


import EventsPage from "@/pages/events";
import EventDetailsPage from "@/pages/eventDetails";
import ParticipantDetailsPage from "./pages/ParticipantDetails";
import Dashboard from "./pages/Dashboard";
function App() {
  
  return (
    <Routes>
      <Route element={<EventsPage />} path="/events" />
      <Route element={<EventDetailsPage />} path="/events/:id" />
      <Route
        element={<ParticipantDetailsPage  />}
        path="/events/:eventId/participants/:talentId"
        />
      <Route element={<Dashboard />} path="/" />


    </Routes>
  );
}

export default App;
