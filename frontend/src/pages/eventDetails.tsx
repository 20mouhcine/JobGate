import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import DefaultLayout from "@/layouts/default";
import { Users, Download } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@heroui/button";

// Move interface outside component for better organization
interface Event {
  id: string | number;
  title: string; // Changed from title to match your API
  date: string;
  location: string;
  description: string;
  is_timeSlot_enabled: boolean;
}

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/events/";

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("Event ID is required");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}${id}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id, apiUrl]); // Added dependencies

  // Function to download QR code as PNG
  const downloadQRCode = () => {
    if (!qrCodeRef.current || !event) return;

    const svg = qrCodeRef.current.querySelector("svg");
    if (!svg) return;

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (make it larger for better quality)
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    // Create an image from the SVG
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Fill canvas with white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, size, size);

      // Draw the QR code
      ctx.drawImage(img, 0, 0, size, size);

      // Create download link
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `qr-code-${event.title.replace(/\s+/g, "-").toLowerCase()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, "image/png");

      URL.revokeObjectURL(svgUrl);
    };

    img.src = svgUrl;
  };

  // Loading state
  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }
  console.log(event);

  // Error state
  if (error) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Event not found
  if (!event) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Event Not Found
            </h2>
            <p className="text-gray-600">
              The event you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-100 py-8 w-full">
        <div className="max-w-6xl mx-auto px-4">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Navigation
                </h2>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#about"
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <span>ℹ️</span>À propos
                    </a>
                  </li>
                  <li>
                    <a
                      href="#participants"
                      className="flex items-center gap-4 text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <span>
                        <Users />
                      </span>
                      Participants
                    </a>
                  </li>
                  
                </ul>
              </div>

              {/* QR Code Section */}
              <div className="bg-white shadow-md rounded-lg p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 items-center">
                    QR Code
                  </h2>
                  <Button
                    onClick={downloadQRCode}
                    variant="flat"
                    color="primary"
                    className="flex items-center gap-2 text-white rounded-md transition-colors"
                  >
                    <Download size={16} color="blue" />
                  </Button>
                </div>
                <div className="flex flex-col items-center">
                    <QRCode value={`${apiUrl}${event.id}/`} size={128} />
                  
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-md rounded-lg p-6">
                <section id="about" className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {event.title}
                  </h2>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-gray-600">
                      📅 {formatDate(event.date)}
                    </span>
                    <span className="text-gray-600">📍 {event.location}</span>
                  </div>
                  <div className="prose max-w-none">
                    {event.description ? (
                      <p className="text-gray-700 leading-relaxed">
                        {event.description}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">
                        Aucune description disponible pour cet événement.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
