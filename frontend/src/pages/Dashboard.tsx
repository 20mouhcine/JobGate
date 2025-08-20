import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Register Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [nbParticipations, setNbParticipations] = useState(0)
  const [nbAttend, setNbAttend] = useState(0)
  const [t3StarsPlus, setT3StarsPlus] = useState(0)
  const [t5Stars, setT5Stars] = useState(0)
  const [establishments, setEstablishments] = useState<{ name: string, count: number }[]>([]);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchNbParticipant = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/participations`);
        const data = await response.json();

        // Calculate everything in one go to avoid timing issues
        const total = data.length;
        const attended = data.filter((e) => e.has_attended === true).length;
        const fiveStars = data.filter((e) => e.note === 5).length;
        const threeStarsPlus = data.filter((e) => e.note >= 3).length;

        // Calculate establishments with proper number conversion
        const establishmentCounts: { [key: string]: number } = {};

        data.forEach(participation => {
          const establishment = participation.talent_id?.etablissement || 'Non spécifié';

          if (establishment) {
            establishmentCounts[establishment] = (establishmentCounts[establishment] || 0) + 1;
          }
        });

        // Convert to array and ensure numbers are integers
        const establishmentsData = Object.entries(establishmentCounts)
          .map(([name, count]) => ({
            name,
            count: Math.round(Number(count)) // Force integer conversion
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Update all states at once
        setNbParticipations(total);
        setNbAttend(attended);
        setT5Stars(fiveStars);
        setT3StarsPlus(threeStarsPlus);
        setEstablishments(establishmentsData);

        // Debug log after state is set
        console.log("Establishments data:", establishmentsData);
        console.log("First establishment:", establishmentsData[0]);

      } catch (error) {
        console.error("Error fetching participant:", error);
        toast.error("Failed to load participant details");
      } finally {
        setLoading(false);
      }
    };

    fetchNbParticipant();
  }, []);



  const stats = {
    totalTalents: nbParticipations,
    talentsMet: nbAttend,
    talents3StarsPlus: t3StarsPlus,
    talents5Stars: t5Stars,
    attendanceRate: nbParticipations > 0 ? Math.round((nbAttend / nbParticipations) * 100) : 0,
    establishments: establishments
  };

  // Chart data configurations
  const establishmentsChartData = {
    labels: stats.establishments.map(e => e.name),
    datasets: [
      {
        label: 'Number of candidates',
        data: stats.establishments.map(e => Math.round(Number(e.count))),
        backgroundColor: [
          'rgba(30, 14, 153, 0.7)',
          '#f0c300',
          'rgba(16, 185, 129, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const attendanceChartData = {
    labels: ['Présents', 'Absents'],
    datasets: [
      {
        data: [stats.talentsMet, stats.totalTalents - stats.talentsMet],
        backgroundColor: [
          '#f0c300',
          'rgba(30, 14, 153, 0.7)',
        ],
        borderWidth: 1,
      }
    ]
  };
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <DefaultLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord des Salons de Recrutement</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Talents Inscrits"
            value={stats.totalTalents}
            icon={<UsersIcon className="text-blue-500" />}
          // trend="+12% from last event"
          />

          <StatCard
            title="Talents Inscrits"
            value={stats.talentsMet}
            icon={<HandshakeIcon className="text-green-500" />}
            description={`${stats.attendanceRate}% de taux de présence`}
          />

          <StatCard
            title="3+ Étoiles"
            value={stats.talents3StarsPlus}
            icon={<StarIcon className="text-yellow-500" />}
            description={`${((stats.talents3StarsPlus / stats.talentsMet) * 100).toFixed(1)}% des entretiens`}
          />

          <StatCard
            title="5 Étoiles"
            value={stats.talents5Stars}
            icon={<TrophyIcon className="text-purple-500" />}
            description={`${((stats.talents5Stars / stats.talentsMet) * 100).toFixed(1)}% des entretiens`}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Rate */}
          <Card className="col-span-1">
            <CardHeader>
              <h2 className="text-xl font-semibold">Taux de Présence</h2>
            </CardHeader>
            <CardBody>
              <div className="h-64">
                <Pie
                  data={attendanceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </CardBody>
          </Card>

          {/* Top Institutions */}
          <Card className="col-span-2">
            <CardHeader>
              <h2 className="text-xl font-semibold">Établissements les Plus Représentés</h2>
            </CardHeader>
            <CardBody>
              <div className="h-64">
                <Bar
                  data={establishmentsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1, // Force integer steps
                          callback: function (value) {
                            if (value % 1 === 0) { // Only show whole numbers
                              return value;
                            }
                          }
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value} candidats`;
                          }
                        }
                      }
                    }
                  }
                  }
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, description, trend }) => (
  <Card>
    <CardHeader className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <div className="p-2 rounded-full bg-gray-100">
        {icon}
      </div>
    </CardHeader>
    <CardBody>
      <p className="text-3xl font-bold">{value.toLocaleString()}</p>
      {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
    </CardBody>
    {trend && (
      <CardFooter>
        <Badge color="green">{trend}</Badge>
      </CardFooter>
    )}
  </Card>
);

// Icon Components
const UsersIcon = ({ className }) => (
  <svg className={`w-6 h-6 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const HandshakeIcon = ({ className }) => (
  <svg className={`w-6 h-6 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={`w-6 h-6 ${className}`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const TrophyIcon = ({ className }) => (
  <svg className={`w-6 h-6 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Dashboard;