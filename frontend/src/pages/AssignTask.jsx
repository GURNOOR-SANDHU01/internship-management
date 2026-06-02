import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AssignTask = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const editingTask = location.state?.task || null;
  const [interns, setInterns] = useState([]);

  const [taskForm, setTaskForm] = useState({ intern: '', title: '', description: '', priority: 'Medium', dueDate: '' });

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5002/api/mentor/interns', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setInterns(data);
          if (!editingTask && data.length > 0) {
            setTaskForm(prev => ({ ...prev, intern: data[0].intern?._id || '' }));
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchInterns();
  }, [editingTask]);

  useEffect(() => {
    if (editingTask) {
      setTaskForm({
        intern: editingTask.intern?._id || editingTask.intern,
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority,
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.intern) {
      toast.error('You must select an intern to assign a task.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = editingTask ? `http://localhost:5002/api/mentor/tasks/${id}` : 'http://localhost:5002/api/mentor/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const payload = { ...taskForm };
      if (!payload.dueDate) delete payload.dueDate;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(editingTask ? 'Task updated successfully!' : 'Task assigned successfully!');
        navigate('/mentor/dashboard');
      } else { 
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || 'Failed to save task'); 
      }
    } catch (err) { console.error(err); toast.error(err.message || 'Error saving task'); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate('/mentor/dashboard')} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </button>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingTask ? 'Edit Task' : 'Assign New Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Intern</label>
            <select name="intern" value={taskForm.intern} onChange={e => setTaskForm({...taskForm, intern: e.target.value})} required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
              <option value="">-- Select --</option>
              {interns.map(a => <option key={a._id} value={a.intern?._id}>{a.intern?.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-teal-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-teal-700 transition-colors">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AssignTask;
