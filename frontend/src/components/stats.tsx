import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  CircleAlert,
  ChartArea,
  Star,
  Trophy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Stats = ({ eventId }: { eventId: number }) => {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Chart colors (matching eventDetails.tsx)
  const COLORS = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#8B5CF6',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    success: '#10B981',
    purple: '#8B5CF6',
    orange: '#F97316',
    pink: '#EC4899',
    indigo: '#6366F1',
    teal: '#14B8A6',
  };

  const PIE_COLORS = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.accent,
    COLORS.warning,
    COLORS.danger,
    COLORS.info,
    COLORS.purple,
    COLORS.orange,
    COLORS.pink,
    COLORS.indigo,
    COLORS.teal,
  ];

  useEffect(() => {
    const fetchEventStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/events/${eventId}/statistics/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch event statistics');
        }
        
        const data = await response.json();
        console.log("Event statistics data:", data); // Debug log
        setStatsData(data);
        
      } catch (error) {
        console.error("Error fetching event statistics:", error);
        toast.error("Failed to load event statistics");
        // Set fallback data to prevent empty state
        setStatsData({
          overview: {
            total_participants: 0,
            attended_participants: 0,
            selected_participants: 0,
            attendance_rate: 0,
            selection_rate: 0,
            average_rating: 0
          },
          demographics: {
            by_establishment: [],
            by_filiere: []
          }
        });
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventStatistics();
    }
  }, [eventId]);

  // Prepare data from API response
  const stats = statsData ? {
    totalTalents: statsData.overview.total_participants,
    talentsMet: statsData.overview.attended_participants,
    selectedTalents: statsData.overview.selected_participants || 0,
    talents3StarsPlus: statsData.top_participants?.filter((p: any) => p.note >= 3).length || 0,
    talents5Stars: statsData.top_participants?.filter((p: any) => p.note === 5).length || 0,
    attendanceRate: statsData.overview.attendance_rate,
    selectionRate: statsData.overview.selection_rate || 0,
    selectionFromAttendedRate: statsData.overview.attended_participants > 0 ? 
      ((statsData.overview.selected_participants || 0) / statsData.overview.attended_participants * 100).toFixed(1) : 0,
    averageRating: statsData.overview.average_rating,
    establishments: statsData.demographics.by_establishment.slice(0, 5), // Top 5 establishments
    filieres: statsData.demographics.by_filiere?.slice(0, 5) || [], // Top 5 programs
    noShowRate: statsData.overview.total_participants > 0 ? 
      ((statsData.overview.total_participants - statsData.overview.attended_participants) / statsData.overview.total_participants * 100).toFixed(1) : 0,
    conversionRate: statsData.overview.total_participants > 0 ? 
      ((statsData.overview.selected_participants || 0) / statsData.overview.total_participants * 100).toFixed(1) : 0
  } : {
    totalTalents: 0,
    talentsMet: 0,
    selectedTalents: 0,
    talents3StarsPlus: 0,
    talents5Stars: 0,
    attendanceRate: 0,
    selectionRate: 0,
    selectionFromAttendedRate: 0,
    averageRating: 0,
    establishments: [],
    filieres: [],
    noShowRate: 0,
    conversionRate: 0
  };

  // Prepare chart data
  const prepareEstablishmentChartData = () => {
    return stats.establishments.map((establishment: any, index: number) => ({
      name: establishment.talent_id__etablissement || 'Non spécifié',
      value: establishment.count,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));
  };

  const prepareAttendanceChartData = () => {
    return [
      {
        name: 'Présents',
        value: stats.talentsMet,
        fill: COLORS.success,
      },
      {
        name: 'Absents',
        value: stats.totalTalents - stats.talentsMet,
        fill: COLORS.primary,
      },
    ];
  };

  const prepareSelectionChartData = () => {
    return [
      {
        name: 'Sélectionnés',
        value: stats.selectedTalents,
        fill: COLORS.success,
      },
      {
        name: 'Non sélectionnés',
        value: stats.talentsMet - stats.selectedTalents,
        fill: COLORS.warning,
      },
    ];
  };

  const prepareFiliereChartData = () => {
    return stats.filieres.map((filiere: any, index: number) => ({
      name: filiere.talent_id__filiere || 'Non spécifié',
      value: filiere.count,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));
  };

  const prepareConversionFunnelData = () => {
    const data = [
      {
        stage: 'Inscrits',
        count: stats.totalTalents || 0,
        percentage: 100,
        fill: COLORS.primary,
      },
      {
        stage: 'Présents',
        count: stats.talentsMet || 0,
        percentage: stats.attendanceRate || 0,
        fill: COLORS.info,
      },
      {
        stage: 'Sélectionnés',
        count: stats.selectedTalents || 0,
        percentage: typeof stats.conversionRate === 'string' ? parseFloat(stats.conversionRate) : (stats.conversionRate || 0),
        fill: COLORS.success,
      },
    ];
    console.log('Conversion funnel data:', data); // Debug log
    return data;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Chargement des statistiques...</span>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500">Aucune donnée statistique disponible</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Vue d'ensemble - Overview Chart */}
        <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Vue d'ensemble des KPIs de l'événement</h3>
            <div className="bg-blue-100 p-2 rounded-lg">
              <ChartArea className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          {/* KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total des talents inscrits */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-600 text-xs font-semibold uppercase tracking-wide">Total Inscrits</div>
                  <div className="text-2xl font-bold text-blue-700 mt-1">
                    {stats.totalTalents}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Talents au salon</div>
                </div>
                <div className="bg-blue-500 p-2 rounded-full">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Talents effectivement rencontrés */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-600 text-xs font-semibold uppercase tracking-wide">Talents Rencontrés</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">
                    {stats.talentsMet}
                  </div>
                  <div className="text-xs text-green-600 mt-1">Effectivement présents</div>
                </div>
                <div className="bg-green-500 p-2 rounded-full">
                  <CircleAlert className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Talents sélectionnés */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-emerald-600 text-xs font-semibold uppercase tracking-wide">Talents Sélectionnés</div>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">
                    {stats.selectedTalents}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">Candidats retenus</div>
                </div>
                <div className="bg-emerald-500 p-2 rounded-full">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Taux de présence */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-purple-600 text-xs font-semibold uppercase tracking-wide">Taux de Présence</div>
                  <div className="text-2xl font-bold text-purple-700 mt-1">
                    {stats.attendanceRate}%
                  </div>
                  <div className="text-xs text-purple-600 mt-1">Présents/Inscrits</div>
                </div>
                <div className="bg-purple-500 p-2 rounded-full">
                  <ChartArea className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Selection Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Taux de sélection des présents */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border border-cyan-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-cyan-600 text-xs font-semibold uppercase tracking-wide">Sélection/Présents</div>
                  <div className="text-2xl font-bold text-cyan-700 mt-1">
                    {stats.selectionFromAttendedRate}%
                  </div>
                  <div className="text-xs text-cyan-600 mt-1">Taux de conversion</div>
                </div>
                <div className="bg-cyan-500 p-2 rounded-full">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Taux d'absentéisme */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-red-600 text-xs font-semibold uppercase tracking-wide">Taux d'Absence</div>
                  <div className="text-2xl font-bold text-red-700 mt-1">
                    {stats.noShowRate}%
                  </div>
                  <div className="text-xs text-red-600 mt-1">No-show rate</div>
                </div>
                <div className="bg-red-500 p-2 rounded-full">
                  <CircleAlert className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Conversion globale */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-indigo-600 text-xs font-semibold uppercase tracking-wide">Conversion Globale</div>
                  <div className="text-2xl font-bold text-indigo-700 mt-1">
                    {stats.conversionRate}%
                  </div>
                  <div className="text-xs text-indigo-600 mt-1">Sélectionnés/Inscrits</div>
                </div>
                <div className="bg-indigo-500 p-2 rounded-full">
                  <ChartArea className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Note moyenne */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-yellow-600 text-xs font-semibold uppercase tracking-wide">Note Moyenne</div>
                  <div className="text-2xl font-bold text-yellow-700 mt-1">
                    {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">Sur 5 étoiles</div>
                </div>
                <div className="bg-yellow-500 p-2 rounded-full">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Candidats 3+ étoiles */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-amber-600 text-xs font-semibold uppercase tracking-wide">3+ Étoiles</div>
                  <div className="text-2xl font-bold text-amber-700 mt-1">
                    {stats.talents3StarsPlus}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    {stats.talentsMet > 0 ? ((stats.talents3StarsPlus / stats.talentsMet) * 100).toFixed(1) : 0}% des entretiens
                  </div>
                </div>
                <div className="bg-amber-500 p-2 rounded-full">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Talents 5 étoiles */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-orange-600 text-xs font-semibold uppercase tracking-wide">5 Étoiles</div>
                  <div className="text-2xl font-bold text-orange-700 mt-1">
                    {stats.talents5Stars}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    {stats.talentsMet > 0 ? ((stats.talents5Stars / stats.talentsMet) * 100).toFixed(1) : 0}% note maximale
                  </div>
                </div>
                <div className="bg-orange-500 p-2 rounded-full">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Établissements représentés */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-teal-600 text-xs font-semibold uppercase tracking-wide">Établissements</div>
                  <div className="text-2xl font-bold text-teal-700 mt-1">
                    {stats.establishments.length}
                  </div>
                  <div className="text-xs text-teal-600 mt-1">Représentés</div>
                </div>
                <div className="bg-teal-500 p-2 rounded-full">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Attendance Rate */}
          <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Taux de Présence</h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <ChartArea className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-sm h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareAttendanceChartData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }: any) => 
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {prepareAttendanceChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: '15px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Institutions */}
          <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Établissements les Plus Représentés</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareEstablishmentChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                    stroke="#64748b"
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11}
                    tickFormatter={(value) => Math.round(value).toString()}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any) => [`${value} candidats`, 'Nombre']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={COLORS.primary}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Selection and Conversion Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Selection Rate Chart */}
          <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Taux de Sélection</h3>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-sm h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareSelectionChartData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }: any) => 
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {prepareSelectionChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: '15px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filières Chart */}
          {stats.filieres.length > 0 && (
            <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Filières les Plus Représentées</h3>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <ChartArea className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareFiliereChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                      stroke="#64748b"
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11}
                      tickFormatter={(value) => Math.round(value).toString()}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any) => [`${value} candidats`, 'Nombre']}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={COLORS.accent}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Entonnoir de Conversion</h3>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <ChartArea className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={prepareConversionFunnelData()} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="stage"
                  stroke="#64748b" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11}
                  tickFormatter={(value) => Math.round(value).toString()}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, _: any, props: any) => [
                    `${value} candidats (${props.payload.percentage.toFixed(1)}%)`,
                    'Nombre'
                  ]}
                />
                <Bar 
                  dataKey="count" 
                  fill={COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={100}
                >
                  {prepareConversionFunnelData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Funnel Summary */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{stats.totalTalents}</div>
              <div className="text-sm text-blue-600">Candidats inscrits</div>
            </div>
            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-700">{stats.talentsMet}</div>
              <div className="text-sm text-cyan-600">Candidats présents ({stats.attendanceRate}%)</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-700">{stats.selectedTalents}</div>
              <div className="text-sm text-emerald-600">Candidats sélectionnés ({stats.conversionRate}%)</div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Stats;