/*
  @author Gurnoor SINGH (102316101) 
*/
import { useState, useEffect, useContext } from 'react';
import { 
  Users, LayoutDashboard, CheckSquare, Star, MessageSquare, 
  UserCheck, AlertCircle, CalendarClock, Clock, CheckCircle,
  Plus, Trash2, Edit, X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MentorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ intern: '', title: '', description: '', priority: 'Medium', dueDate: '' });

  // Feedback state
  const [feedbackForm, setFeedbackForm] = useState({ assignmentId: '', text: '', rating: 5 });
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [internsRes, tasksRes] = await Promise.all([
          fetch('http://localhost:5002/api/mentor/interns', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5002/api/mentor/tasks', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (internsRes.ok) setInterns(await internsRes.json());
        if (tasksRes.ok) setTasks(await tasksRes.json());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching mentor data:', err);
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  // Task handlers
  const handleOpenTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        intern: task.intern?._id || task.intern,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingTask(null);
      setTaskForm({ intern: interns[0]?.intern?._id || '', title: '', description: '', priority: 'Medium', dueDate: '' });
    }
    setIsTaskModalOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!taskForm.intern) {
      alert('You must select an intern to assign a task.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = editingTask ? `http://localhost:5002/api/mentor/tasks/${editingTask._id}` : 'http://localhost:5002/api/mentor/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const payload = { ...taskForm };
      if (!payload.dueDate) delete payload.dueDate; // Prevent casting errors for empty dates

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        if (editingTask) {
          setTasks(tasks.map(t => t._id === saved._id ? saved : t));
        } else {
          setTasks([saved, ...tasks]);
        }
        setIsTaskModalOpen(false);
      } else { 
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Failed to save task'); 
      }
    } catch (err) { console.error(err); alert(err.message || 'Error saving task'); }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/mentor/tasks/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTasks(tasks.filter(t => t._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'Pending' ? 'In Progress' : task.status === 'In Progress' ? 'Completed' : 'Pending';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/mentor/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(tasks.map(t => t._id === updated._id ? updated : t));
      }
    } catch (err) { console.error(err); }
  };

  // Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setFeedbackSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/mentor/feedback/${feedbackForm.assignmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: feedbackForm.text, rating: feedbackForm.rating })
      });
      if (res.ok) {
        const updated = await res.json();
        setInterns(interns.map(i => i._id === updated._id ? updated : i));
        alert('Feedback submitted!');
        setFeedbackForm({ ...feedbackForm, text: '', rating: 5 });
      } else { alert('Failed to submit feedback'); }
    } catch (err) { console.error(err); }
    finally { setFeedbackSaving(false); }
  };

  // Computed stats
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const allFeedback = interns.reduce((acc, i) => acc + (i.feedback?.length || 0), 0);
  const avgRating = interns.reduce((acc, i) => {
    const ratings = i.feedback?.map(f => f.rating).filter(Boolean) || [];
    return acc.concat(ratings);
  }, []);
  const avgRatingValue = avgRating.length > 0 ? (avgRating.reduce((a, b) => a + b, 0) / avgRating.length).toFixed(1) : 'N/A';

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Assigned Interns', value: interns.length, icon: Users, bg: 'bg-teal-50', color: 'text-teal-600' },
          { label: 'Pending Tasks', value: pendingTasks, icon: CheckSquare, bg: 'bg-orange-50', color: 'text-orange-600' },
          { label: 'Feedback Given', value: allFeedback, icon: MessageSquare, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Avg Rating', value: avgRatingValue, icon: Star, bg: 'bg-yellow-50', color: 'text-yellow-600' },
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

  const renderInterns = () => (
    <div className="animate-in fade-in space-y-6">
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Assigned Interns & Progress</h2></div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interns.length > 0 ? interns.map((assignment) => (
              <tr key={assignment._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 mr-3">{assignment.intern?.name?.charAt(0) || '?'}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{assignment.intern?.name}</div>
                      <div className="text-xs text-gray-500">{assignment.intern?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.project}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${assignment.progress}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">{assignment.progress}%</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{assignment.attendance}</td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No interns assigned yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="animate-in fade-in space-y-6">
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Task Management</h2>
          <button 
            onClick={() => handleOpenTaskModal()} 
            disabled={interns.length === 0}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            title={interns.length === 0 ? "You need assigned interns to create a task" : ""}
          >
            <Plus className="h-4 w-4 mr-2" /> Assign New Task
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.length > 0 ? tasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.intern?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.priority === 'High' ? 'bg-red-100 text-red-800' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>{task.priority}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => handleToggleTaskStatus(task)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                    {task.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {task.status === 'In Progress' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {task.status}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenTaskModal(task)} className="text-indigo-600 hover:text-indigo-900 mx-1"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDeleteTask(task._id)} className="text-red-600 hover:text-red-900 mx-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No tasks created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="animate-in fade-in space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Feedback</h2>
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Intern</label>
            <select value={feedbackForm.assignmentId} onChange={e => setFeedbackForm({...feedbackForm, assignmentId: e.target.value})} required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
              <option value="">-- Select an intern --</option>
              {interns.map(a => (
                <option key={a._id} value={a._id}>{a.intern?.name} — {a.project}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button type="button" key={n} onClick={() => setFeedbackForm({...feedbackForm, rating: n})}
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-colors ${feedbackForm.rating >= n ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
            <textarea value={feedbackForm.text} onChange={e => setFeedbackForm({...feedbackForm, text: e.target.value})} required rows="4"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" placeholder="Provide constructive feedback..."></textarea>
          </div>
          <button type="submit" disabled={feedbackSaving} className="bg-teal-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50">
            {feedbackSaving ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      {/* Previous feedback */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Previous Feedback</h2>
        {interns.filter(a => a.feedback?.length > 0).length > 0 ? (
          <div className="space-y-4">
            {interns.filter(a => a.feedback?.length > 0).map(a => (
              <div key={a._id}>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{a.intern?.name} — {a.project}</h3>
                {a.feedback.map((f, idx) => (
                  <div key={idx} className="ml-4 border-l-2 border-teal-200 pl-4 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} className={`h-3 w-3 ${n <= f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}</div>
                      <span className="text-xs text-gray-500">{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{f.text}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No feedback submitted yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-76px)] bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg">{user?.name?.charAt(0) || 'M'}</div>
            <div>
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Mentor User'}</p>
              <p className="text-xs text-teal-600 font-semibold">Technical Mentor</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', name: 'Overview', icon: LayoutDashboard },
            { id: 'interns', name: 'Assigned Interns', icon: Users },
            { id: 'tasks', name: 'Task Management', icon: CheckSquare },
            { id: 'feedback', name: 'Feedback & Ratings', icon: Star },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-teal-700' : 'text-gray-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 hidden md:block capitalize">
            {activeTab === 'interns' ? 'Assigned Interns' : activeTab.replace('-', ' ')}
          </h1>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'interns' && renderInterns()}
          {activeTab === 'tasks' && renderTasks()}
          {activeTab === 'feedback' && renderFeedback()}
        </div>
      </main>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsTaskModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{editingTask ? 'Edit Task' : 'Assign New Task'}</h3>
                <form id="task-form" onSubmit={handleSubmitTask} className="space-y-4">
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
                    <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows="2" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"></textarea>
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
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="submit" form="task-form" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-white font-medium hover:bg-teal-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
