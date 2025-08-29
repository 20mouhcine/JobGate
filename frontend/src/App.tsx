import { Route, Routes } from "react-router-dom";


import EventsPage from "@/pages/events";
import EventDetailsPage from "@/pages/eventDetails";
import ParticipantDetailsPage from "./pages/ParticipantDetails";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
function App() {
  
  return (
    <Routes>
      <Route element={<EventsPage />} path="/events" />
      <Route element={<EventDetailsPage />} path="/events/:id" />
      <Route
        element={<ParticipantDetailsPage  />}
        path="/events/:eventId/participants/:talentId"
        />
      <Route element={<Login />} path="/" />
      <Route element={<Signup />} path="/signup" />

    </Routes>
  );
}

export default App;
