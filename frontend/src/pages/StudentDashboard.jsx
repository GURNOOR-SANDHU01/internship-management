/*
  @author Gurnoor SINGH (102316101) 
*/
import { useState, useEffect, useContext } from 'react';
import { 
  Search, Briefcase, MapPin, DollarSign, LayoutDashboard, 
  FileText, Bookmark, User, Bell, Award, CalendarClock,
  CheckCircle, Clock, UploadCloud, BookmarkCheck
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [internships, setInternships] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedInternships')) || []; } catch { return []; }
  });

  // Profile state
  const [profile, setProfile] = useState({ phone: '', skills: '', linkedin: '', github: '', projects: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const res = await fetch('http://localhost:5002/api/internships');
        const data = await res.json();
        setInternships(data);

        if (token) {
          const appRes = await fetch('http://localhost:5002/api/applications/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (appRes.ok) {
            const appData = await appRes.json();
            setMyApplications(appData);
          }

          // Fetch profile
          const profRes = await fetch('http://localhost:5002/api/profiles/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profRes.ok) {
            const profData = await profRes.json();
            if (!profData._empty) {
              setProfile({
                phone: profData.phone || '',
                skills: Array.isArray(profData.skills) ? profData.skills.join(', ') : '',
                linkedin: profData.linkedin || '',
                github: profData.github || '',
                projects: profData.projects?.map(p => `${p.title}: ${p.description}`).join('\n') || '',
              });
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApply = async (internshipId) => {
    try {
      setApplying(internshipId);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5002/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ internshipId })
      });
      
      if (res.ok) {
        toast.success('Successfully applied!');
        const appRes = await fetch('http://localhost:5002/api/applications/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (appRes.ok) {
          const appData = await appRes.json();
          setMyApplications(appData);
        }
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to apply');
      }
    } catch (error) {
      console.error('Apply error:', error);
      toast.error('An error occurred while applying.');
    } finally {
      setApplying(null);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        phone: profile.phone,
        skills: profile.skills.split(',').map(s => s.trim()).filter(s => s),
        linkedin: profile.linkedin,
        github: profile.github,
        projects: profile.projects.split('\n').filter(p => p.trim()).map(p => {
          const parts = p.split(':');
          return { title: parts[0]?.trim() || '', description: parts.slice(1).join(':').trim() || '' };
        }),
      };
      const res = await fetch('http://localhost:5002/api/profiles/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('Profile saved!');
      } else {
        toast.error('Failed to save profile');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const toggleSave = (id) => {
    const updated = savedIds.includes(id) ? savedIds.filter(s => s !== id) : [...savedIds, id];
    setSavedIds(updated);
    localStorage.setItem('savedInternships', JSON.stringify(updated));
  };

  const appliedInternshipIds = myApplications.map(a => a.internship?._id);

  const filteredInternships = internships.filter(internship => 
    internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (internship.companyName && internship.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Computed stats
  const totalApps = myApplications.length;
  const shortlisted = myApplications.filter(a => a.status === 'Shortlisted').length;
  const interviews = myApplications.filter(a => a.status === 'Interview').length;
  const hired = myApplications.filter(a => a.status === 'Hired').length;

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Completion</h2>
        <div className="flex items-center gap-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${profile.skills ? '80%' : '40%'}` }}></div>
          </div>
          <span className="text-sm font-semibold text-primary">{profile.skills ? '80%' : '40%'}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {profile.skills ? 'Looking good! Add more projects to reach 100%.' : 'Complete your profile to get better internship matches.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary mr-4">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Applications</p>
            <h4 className="text-2xl font-bold text-gray-900">{totalApps}</h4>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600 mr-4">
            <CalendarClock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Interviews Scheduled</p>
            <h4 className="text-2xl font-bold text-gray-900">{interviews}</h4>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Shortlisted</p>
            <h4 className="text-2xl font-bold text-gray-900">{shortlisted}</h4>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600 mr-4">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Hired</p>
            <h4 className="text-2xl font-bold text-gray-900">{hired}</h4>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDiscover = () => (
    <div className="animate-in fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 transition-colors"
            placeholder="Search internships by title, company, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Internships</h2>
      
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading internships...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredInternships.map((internship) => {
            const alreadyApplied = appliedInternshipIds.includes(internship._id);
            return (
              <div key={internship._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleSave(internship._id)} className={`transition-colors ${savedIds.includes(internship._id) ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
                      {savedIds.includes(internship._id) ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                    </button>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {internship.type}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{internship.title}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">{internship.companyName}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {internship.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    {internship.stipend || 'Unpaid'}
                  </div>
                </div>
                
                <button 
                  onClick={() => !alreadyApplied && handleApply(internship._id)}
                  disabled={applying === internship._id || alreadyApplied}
                  className={`mt-6 w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
                    alreadyApplied 
                      ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' 
                      : 'bg-white border border-primary text-primary hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {alreadyApplied ? '✓ Applied' : applying === internship._id ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            );
          })}
          {filteredInternships.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">No internships found matching your search.</div>
          )}
        </div>
      )}
    </div>
  );

  const renderApplications = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Application Status Tracking</h2>
        <span className="text-sm text-gray-500">{myApplications.length} application{myApplications.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Internship</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {myApplications.length > 0 ? (
              myApplications.map((app) => (
                <tr key={app._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.internship?.title || 'Unknown Internship'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.internship?.companyName || 'Unknown Company'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${app.status === 'Applied' ? 'bg-yellow-100 text-yellow-800' : 
                        app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' : 
                        app.status === 'Interview' ? 'bg-purple-100 text-purple-800' : 
                        app.status === 'Hired' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  You haven't applied to any internships yet. Go to Discover to find one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSaved = () => {
    const saved = internships.filter(i => savedIds.includes(i._id));
    return (
      <div className="animate-in fade-in">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Internships ({saved.length})</h2>
        {saved.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {saved.map((internship) => (
              <div key={internship._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{internship.title}</h3>
                  <button onClick={() => toggleSave(internship._id)} className="text-primary"><BookmarkCheck className="h-5 w-5" /></button>
                </div>
                <p className="text-sm text-gray-500 font-medium">{internship.companyName}</p>
                <div className="mt-3 flex items-center text-sm text-gray-500"><MapPin className="h-4 w-4 mr-1" />{internship.location}</div>
                <div className="mt-1 flex items-center text-sm text-gray-500"><DollarSign className="h-4 w-4 mr-1" />{internship.stipend || 'Unpaid'}</div>
                <button 
                  onClick={() => handleApply(internship._id)}
                  disabled={appliedInternshipIds.includes(internship._id)}
                  className={`mt-4 w-full py-2 rounded-lg font-semibold transition-colors ${
                    appliedInternshipIds.includes(internship._id) 
                      ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' 
                      : 'bg-primary text-white hover:bg-blue-600'
                  }`}
                >
                  {appliedInternshipIds.includes(internship._id) ? '✓ Applied' : 'Apply Now'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Saved Internships</h3>
            <p className="text-gray-500">Bookmark internships from the Discover tab to see them here.</p>
          </div>
        )}
      </div>
    );
  };

  const renderNotifications = () => {
    const notifications = myApplications
      .filter(a => a.status !== 'Applied')
      .map(a => ({
        id: a._id,
        text: `Your application for "${a.internship?.title}" has been updated to "${a.status}"`,
        date: new Date(a.appliedAt).toLocaleDateString(),
        status: a.status,
      }));

    return (
      <div className="animate-in fade-in">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications ({notifications.length})</h2>
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  n.status === 'Hired' ? 'bg-green-100 text-green-600' :
                  n.status === 'Interview' ? 'bg-purple-100 text-purple-600' :
                  n.status === 'Shortlisted' ? 'bg-blue-100 text-blue-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{n.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Notifications</h3>
            <p className="text-gray-500">You'll see updates when recruiters change your application status.</p>
          </div>
        )}
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" value={user?.name || 'Student'} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" value={user?.email || ''} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="+1 (555) 000-0000" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
            <input type="url" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="https://linkedin.com/in/username" value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
            <input type="url" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="https://github.com/username" value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma separated)</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="React, Node.js, Python" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Key Projects (one per line, format: Title: Description)</label>
          <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" rows="3" placeholder="Portfolio Site: Built with React and Tailwind..." value={profile.projects} onChange={e => setProfile({...profile, projects: e.target.value})}></textarea>
        </div>

        <button onClick={handleSaveProfile} disabled={profileSaving} className="mt-6 bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50">
          {profileSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-76px)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Student User'}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', name: 'Overview', icon: LayoutDashboard },
            { id: 'discover', name: 'Discover Internships', icon: Search },
            { id: 'applications', name: 'My Applications', icon: FileText },
            { id: 'saved', name: 'Saved Internships', icon: Bookmark, badge: savedIds.length || null },
            { id: 'profile', name: 'Profile & Resume', icon: User },
            { id: 'notifications', name: 'Notifications', icon: Bell, badge: myApplications.filter(a => a.status !== 'Applied').length || null },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-primary' : 'text-gray-400'}`} />
                {item.name}
                {item.badge && <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="md:hidden flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h1>
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0) || 'S'}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8 hidden md:block capitalize">
            {activeTab.replace('-', ' ')}
          </h1>

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'discover' && renderDiscover()}
          {activeTab === 'applications' && renderApplications()}
          {activeTab === 'saved' && renderSaved()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'notifications' && renderNotifications()}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
