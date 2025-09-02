import { Route, Routes } from "react-router-dom";


import EventsPage from "@/pages/events";
import EventDetailsPage from "@/pages/eventDetails";
import ParticipantDetailsPage from "./pages/ParticipantDetails";
import Signup from "@/pages/SignUp";
import Login from "@/pages/Login";
import PrivateRoute from "@/components/PrivateRoute";
function App() {
  
  return (
    <Routes>
      <Route element={<EventsPage />} path="/events" />
      <Route element={<EventDetailsPage />} path="/events/:id" />
        <Route element={<Signup />} path="/signup" />
        <Route element={<Login />} path="/login" />
      <Route element={<PrivateRoute />}>
        <Route
          element={<ParticipantDetailsPage  />}
          path="/events/:eventId/participants/:talentId"
        />
        </Route>

    </Routes>
  );
}

export default App;
