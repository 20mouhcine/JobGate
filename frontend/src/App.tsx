import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import EventsPage from "@/pages/events";
import EventDetailsPage from "@/pages/eventDetails";
import EventsRegister from "./pages/talent/EventsRegister";
function App() {
  
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<PricingPage />} path="/pricing" />
      <Route element={<BlogPage />} path="/blog" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<EventsPage />} path="/events" />
      <Route element={<EventDetailsPage />} path="/events/:id" />
      <Route element={<EventsRegister />} path="/events/register/:eventId" />
    </Routes>
  );
}

export default App;
