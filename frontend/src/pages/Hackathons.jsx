import { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, ArrowRight } from 'lucide-react';

const Hackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/hackathons');
        const data = await res.json();
        setHackathons(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hackathons:', error);
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Upcoming Hackathons</h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Compete, build incredible projects, and showcase your skills to top recruiters worldwide.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {hackathons.map((hackathon) => (
          <div key={hackathon._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex justify-end items-start relative">
              <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold uppercase tracking-wide">
                Upcoming
              </div>
              <Trophy className="h-10 w-10 text-white/80 transform group-hover:scale-110 transition-transform" />
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{hackathon.title}</h3>
              <p className="text-sm text-gray-500 font-medium mb-4">Organized by <span className="text-gray-900">{hackathon.organizer}</span></p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {hackathon.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-primary" />
                  {new Date(hackathon.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-5 w-5 mr-3 text-primary" />
                  {hackathon.participants || '500+'} expected participants
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button className="w-full flex items-center justify-center bg-primary text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                Register Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hackathons;
