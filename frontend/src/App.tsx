import { Route, Routes } from "react-router-dom";


import EventsPage from "@/pages/events";
import EventDetailsPage from "@/pages/eventDetails";
function App() {
  
  return (
    <Routes>
      <Route element={<EventsPage />} path="/events" />
      <Route element={<EventDetailsPage />} path="/events/:id" />
    </Routes>
  );
}

export default App;
