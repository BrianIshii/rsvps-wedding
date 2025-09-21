import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

interface RSVP {
  id: number;
  name: string;
  email: string;
  attending: boolean;
  guests: number;
  dietary_restrictions?: string;
  message?: string;
  created_at: string;
}

export const loader: LoaderFunction = async ({ context }) => {
  try {
    // For development, use mock data if DB is not available
    if (!context?.DB) {
      return json({ 
        rsvps: [], 
        stats: { total: 0, attending: 0, total_guests: 0 }
      });
    }
    
    const rsvps = await context.DB.prepare(
      "SELECT * FROM rsvps ORDER BY created_at DESC"
    ).all();
    
    const stats = await context.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN attending = 1 THEN 1 ELSE 0 END) as attending,
        SUM(CASE WHEN attending = 1 THEN guests ELSE 0 END) as total_guests
      FROM rsvps
    `).first();
    
    return json({ 
      rsvps: rsvps.results || [], 
      stats: stats || { total: 0, attending: 0, total_guests: 0 }
    });
  } catch (error) {
    console.error("Error loading admin data:", error);
    return json({ rsvps: [], stats: { total: 0, attending: 0, total_guests: 0 } });
  }
};

export default function Admin() {
  const { rsvps, stats } = useLoaderData<{ rsvps: RSVP[], stats: any }>();

  const attendingRSVPs = rsvps.filter(rsvp => rsvp.attending);
  const notAttendingRSVPs = rsvps.filter(rsvp => !rsvp.attending);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Wedding RSVP Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and view all RSVP responses</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Responses</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Attending</h3>
            <p className="text-3xl font-bold text-green-600">{stats.attending}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Guests</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.total_guests}</p>
          </div>
        </div>

        {/* Attending RSVPs */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Attending ({attendingRSVPs.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dietary Restrictions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendingRSVPs.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rsvp.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rsvp.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rsvp.guests}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {rsvp.dietary_restrictions || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {rsvp.message || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rsvp.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Not Attending RSVPs */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Not Attending ({notAttendingRSVPs.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notAttendingRSVPs.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rsvp.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rsvp.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {rsvp.message || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rsvp.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Options */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Data</h2>
          <div className="space-x-4">
            <button 
              onClick={() => {
                const csv = convertToCSV(rsvps);
                downloadCSV(csv, 'rsvps.csv');
              }}
              className="btn-primary"
            >
              Export as CSV
            </button>
            <a href="/" className="btn-secondary">
              Back to RSVP Form
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function convertToCSV(rsvps: RSVP[]) {
  const headers = ['Name', 'Email', 'Attending', 'Guests', 'Dietary Restrictions', 'Message', 'Date'];
  const rows = rsvps.map(rsvp => [
    rsvp.name,
    rsvp.email,
    rsvp.attending ? 'Yes' : 'No',
    rsvp.guests,
    rsvp.dietary_restrictions || '',
    rsvp.message || '',
    new Date(rsvp.created_at).toLocaleDateString()
  ]);
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

