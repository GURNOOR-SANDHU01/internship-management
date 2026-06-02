/*
  @author Gurnoor SINGH (102316101) 
*/
import { useState, useContext, useEffect } from 'react';
import { 
  Briefcase, Users, LayoutDashboard, Plus, Edit, Trash2, 
  Search, CheckCircle, CalendarClock, UserCheck, MessageSquare, 
  BarChart3, FileText, Filter, X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RecruiterDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [internships, setInternships] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Company profile state
  const [companyProfile, setCompanyProfile] = useState({
    companyName: '', industry: '', website: '', description: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const resInternships = await fetch('http://localhost:5002/api/internships');
        if (resInternships.ok) {
          const allInternships = await resInternships.json();
          setInternships(allInternships.filter(i => i.recruiter === user?.id || i.recruiter?._id === user?.id));
        }

        const resApps = await fetch('http://localhost:5002/api/applications/recruiter', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resApps.ok) {
          const appsData = await resApps.json();
          setApplicants(appsData);
        }

        // Fetch company profile
        const profRes = await fetch('http://localhost:5002/api/profiles/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          if (!profData._empty) {
            setCompanyProfile({
              companyName: profData.companyName || '',
              industry: profData.industry || '',
              website: profData.website || '',
              description: profData.description || '',
            });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching recruiter data:', error);
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplicants(applicants.map(app => app._id === applicationId ? { ...app, status: newStatus } : app));
        toast.success(`Status updated to ${newStatus}`);
      } else { toast.error('Failed to update status'); }
    } catch (error) { console.error('Status update error:', error); toast.error('Error updating status'); }
  };

  const handleOpenCreateModal = () => {
    navigate('/recruiter/create-internship');
  };

  const handleOpenEditModal = (internship) => {
    navigate(`/recruiter/edit-internship/${internship._id}`, { state: { internship } });
  };

  const handleDeleteInternship = async (id) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/internships/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { 
        setInternships(internships.filter(i => i._id !== id)); 
        toast.success('Internship deleted successfully');
      }
      else { toast.error('Failed to delete internship'); }
    } catch (err) { console.error('Error deleting internship:', err); toast.error('Error deleting internship'); }
  };

  const handleSaveCompanyProfile = async () => {
    setProfileSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5002/api/profiles/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(companyProfile)
      });
      if (res.ok) { toast.success('Company profile saved!'); }
      else { toast.error('Failed to save profile'); }
    } catch (err) { console.error(err); toast.error('Error saving profile'); }
    finally { setProfileSaving(false); }
  };

  // Computed stats
  const activeCount = internships.filter(i => i.status === 'Open').length;
  const totalApplicants = applicants.length;
  const shortlisted = applicants.filter(a => a.status === 'Shortlisted').length;
  const interviewCount = applicants.filter(a => a.status === 'Interview').length;
  const hiredCount = applicants.filter(a => a.status === 'Hired').length;

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Active Internships', value: activeCount, icon: Briefcase, bg: 'bg-blue-50', color: 'text-primary' },
          { label: 'Total Applicants', value: totalApplicants, icon: Users, bg: 'bg-indigo-50', color: 'text-indigo-600' },
          { label: 'Shortlisted', value: shortlisted, icon: UserCheck, bg: 'bg-yellow-50', color: 'text-yellow-600' },
          { label: 'Interviews', value: interviewCount, icon: CalendarClock, bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Hired Interns', value: hiredCount, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className={`h-12 w-12 rounded-lg ${card.bg} flex items-center justify-center ${card.color} mr-4`}>
                <Icon className="h-6 w-6" />
              </div>
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

  const renderManageInternships = () => (
    <div className="animate-in fade-in space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{internships.length} internship{internships.length !== 1 ? 's' : ''} posted</p>
        <button onClick={handleOpenCreateModal} className="bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center shadow-sm">
          <Plus className="h-5 w-5 mr-2" /> Create Internship
        </button>
      </div>
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {internships.length > 0 ? internships.map((posting) => (
              <tr key={posting._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-gray-900">{posting.title}</div></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{posting.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${posting.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{posting.status || 'Open'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicants.filter(a => a.internship?._id === posting._id).length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(posting.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenEditModal(posting)} className="text-indigo-600 hover:text-indigo-900 mx-2" title="Edit"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDeleteInternship(posting._id)} className="text-red-600 hover:text-red-900 mx-2" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">You haven't posted any internships yet.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );

  const renderApplicants = () => (
    <div className="animate-in fade-in space-y-6">
      <p className="text-sm text-gray-500">{applicants.length} applicant{applicants.length !== 1 ? 's' : ''}</p>
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied For</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applicants.length > 0 ? applicants.map((applicant) => (
              <tr key={applicant._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-3">{applicant.student?.name?.charAt(0) || 'U'}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{applicant.student?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{applicant.student?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.internship?.title || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select value={applicant.status} onChange={(e) => handleStatusChange(applicant._id, e.target.value)}
                    className="text-sm border-gray-300 rounded-md py-1 pl-2 pr-6 focus:ring-primary focus:border-primary bg-white border">
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No applicants found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Company Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" value={companyProfile.companyName} onChange={e => setCompanyProfile({...companyProfile, companyName: e.target.value})} placeholder="Your Company" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" value={companyProfile.industry} onChange={e => setCompanyProfile({...companyProfile, industry: e.target.value})} placeholder="e.g. Software Development" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input type="url" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" value={companyProfile.website} onChange={e => setCompanyProfile({...companyProfile, website: e.target.value})} placeholder="https://www.company.com" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
            <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" rows="4" value={companyProfile.description} onChange={e => setCompanyProfile({...companyProfile, description: e.target.value})} placeholder="Describe your company and its mission..."></textarea>
          </div>
        </div>
        <button onClick={handleSaveCompanyProfile} disabled={profileSaving} className="mt-6 bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50">
          {profileSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-76px)] bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">{user?.name?.charAt(0) || 'R'}</div>
            <div>
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Recruiter User'}</p>
              <p className="text-xs text-gray-500">Company Recruiter</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', name: 'Overview', icon: LayoutDashboard },
            { id: 'profile', name: 'Company Profile', icon: Briefcase },
            { id: 'manage', name: 'Manage Internships', icon: Briefcase },
            { id: 'applicants', name: 'View Applicants', icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-primary' : 'text-gray-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 hidden md:block capitalize">{activeTab.replace('-', ' ')}</h1>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'manage' && renderManageInternships()}
          {activeTab === 'applicants' && renderApplicants()}
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
