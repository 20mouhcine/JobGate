import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import DefaultLayout from "@/layouts/default";

import { useState } from "react";
import { Card } from "@mui/material";
import { useParams } from "react-router-dom";

interface Props {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  eventId: number; // event passed via props
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  resume: File | null;
}

export default function EventRegistrationForm({ onSubmit, isLoading = false }: Props) {
  const { eventId } = useParams();
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    resume: null,
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, resume: file }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.resume) {
    setError("Veuillez remplir tous les champs.");
    return;
  }

  setError(null);

  const form = new FormData();
  form.append("first_name", formData.first_name);
  form.append("last_name", formData.last_name);
  form.append("email", formData.email);
  form.append("phone", formData.phone);
  form.append("resume", formData.resume); // File
  form.append("event", eventId.toString()); // hidden field from props

  try {
    const response = await fetch("http://localhost:8000/api/talents/", {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur lors de la soumission:", errorData);
      setError("Erreur lors de la soumission du formulaire.");
      return;
    }

    const result = await response.json();
    console.log("Inscription réussie:", result);
    alert("Inscription réussie !");
    // Reset form if you want:
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      resume: null,
    });
  } catch (error) {
    console.error("Erreur réseau :", error);
    setError("Erreur réseau. Veuillez réessayer.");
  }
};


  return (
    <DefaultLayout>
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-8 w-full max-w-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center">Inscription à l'événement</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500">{error}</div>}

            <Input
              label="Prénom"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />

            <Input
              label="Nom"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-md p-2"
            />

            <Button type="submit" isDisabled={isLoading}>
              {isLoading ? "Envoi en cours..." : "Soumettre"}
            </Button>
          </form>
        </Card>
      </div>
    </DefaultLayout>
  );
}
