import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateInternship = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const editingInternship = location.state?.internship || null;

  const [formData, setFormData] = useState({
    title: '', description: '', requirements: '', stipend: '', location: '', type: 'On-site', companyName: ''
  });

  useEffect(() => {
    if (editingInternship) {
      setFormData({
        title: editingInternship.title, 
        description: editingInternship.description,
        requirements: Array.isArray(editingInternship.requirements) ? editingInternship.requirements.join(', ') : editingInternship.requirements,
        stipend: editingInternship.stipend, 
        location: editingInternship.location, 
        type: editingInternship.type,
        companyName: editingInternship.companyName || ''
      });
    } else {
      // Fetch profile to prefill company name
      const token = localStorage.getItem('token');
      if (token) {
        fetch('http://localhost:5002/api/profiles/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : {})
        .then(data => {
          if (data.companyName) {
            setFormData(prev => ({ ...prev, companyName: data.companyName }));
          }
        })
        .catch(console.error);
      }
    }
  }, [editingInternship]);

  const handleFormChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const reqsArray = formData.requirements.split(',').map(r => r.trim()).filter(r => r);
      const payload = { ...formData, requirements: reqsArray };
      const url = editingInternship ? `http://localhost:5002/api/internships/${id}` : 'http://localhost:5002/api/internships';
      const method = editingInternship ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(editingInternship ? 'Internship updated successfully!' : 'Internship created successfully!');
        navigate('/recruiter/dashboard');
      } else { 
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to save internship'); 
      }
    } catch (err) { console.error('Error saving internship:', err); toast.error(err.message || 'Error saving internship'); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate('/recruiter/dashboard')} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </button>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingInternship ? 'Edit Internship' : 'Create Internship'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleFormChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleFormChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleFormChange} required rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Requirements (comma separated)</label>
            <input type="text" name="requirements" value={formData.requirements} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Stipend</label>
              <input type="text" name="stipend" value={formData.stipend} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select name="type" value={formData.type} onChange={handleFormChange} className="mt-1 block w-full border bg-white border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateInternship;
