/*
  @author Gurnoor SINGH (102316101) 
*/
import { useState, useEffect, useContext } from 'react';
import { 
  Users, LayoutDashboard, Briefcase, DollarSign,
  ShieldCheck, AlertCircle, FileText, BarChart3,
  Bell, Activity, Check, X, Building, Trash2
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [usersRes, statsRes, internshipsRes] = await Promise.all([
          fetch('http://localhost:5002/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5002/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5002/api/admin/internships', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (usersRes.ok) setUsers(await usersRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
        if (internshipsRes.ok) setInternships(await internshipsRes.json());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u._id === updated._id ? updated : u));
      } else { alert('Failed to update role'); }
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/admin/users/${userId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete');
      }
    } catch (err) { console.error(err); }
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, bg: 'bg-blue-50', color: 'text-primary' },
          { label: 'Students', value: stats.students || 0, icon: Users, bg: 'bg-indigo-50', color: 'text-indigo-600' },
          { label: 'Recruiters', value: stats.recruiters || 0, icon: Building, bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Mentors', value: stats.mentors || 0, icon: Users, bg: 'bg-teal-50', color: 'text-teal-600' },
          { label: 'Active Internships', value: stats.activeInternships || 0, icon: Briefcase, bg: 'bg-green-50', color: 'text-green-600' },
          { label: 'Total Applications', value: stats.totalApplications || 0, icon: FileText, bg: 'bg-yellow-50', color: 'text-yellow-600' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className={`h-12 w-12 rounded-lg ${card.bg} flex items-center justify-center ${card.color} mr-4`}><Icon className="h-6 w-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <h4 className="text-2xl font-bold text-gray-900">{card.value}</h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="animate-in fade-in space-y-6">
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">User Management</h2>
          <span className="text-sm text-gray-500">{users.length} users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white mr-3 ${
                        u.role === 'admin' ? 'bg-red-500' : u.role === 'recruiter' ? 'bg-purple-500' : u.role === 'mentor' ? 'bg-teal-500' : 'bg-blue-500'
                      }`}>{u.name?.charAt(0)}</div>
                      <div className="text-sm font-bold text-gray-900">{u.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      disabled={u._id === user?.id}
                      className={`text-sm rounded-md py-1 pl-2 pr-6 bg-white border border-gray-300 focus:ring-primary focus:border-primary ${u._id === user?.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <option value="student">Student</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {u._id !== user?.id && (
                      <button onClick={() => handleDeleteUser(u._id)} className="text-red-600 hover:text-red-900" title="Delete User">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInternships = () => (
    <div className="animate-in fade-in space-y-6">
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">All Internships</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {internships.map((i) => (
                <tr key={i._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i.companyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i.recruiter?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${i.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{i.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(i.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-76px)] bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-lg">{user?.name?.charAt(0) || 'A'}</div>
            <div>
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-red-500 font-semibold">System Administrator</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', name: 'Overview', icon: LayoutDashboard },
            { id: 'users', name: 'User Management', icon: Users },
            { id: 'internships', name: 'Internships', icon: Briefcase },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-red-600' : 'text-gray-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 hidden md:block capitalize">
            {activeTab === 'users' ? 'User Management' : activeTab}
          </h1>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'internships' && renderInternships()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
