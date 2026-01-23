import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getApiUrl } from '../config';

const MentorSearch = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [mentors, setMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiWorks, setApiWorks] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async (query = '') => {
    try {
      setLoading(true);
      setError('');
      
      const url = query 
        ? getApiUrl(`/api/mentors/search?q=${encodeURIComponent(query)}`)
        : getApiUrl('/api/mentors');
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setMentors(data);
        setApiWorks(true);
        if (data.length === 0) {
          setError('No mentors found. Please try a different search.');
        }
      } else {
        // API error - set fallback mode
        setApiWorks(false);
        if (query) {
          setError('Search service unavailable. Showing all mentors.');
          // Load empty mentors list for manual display
          setMentors([]);
        } else {
          setError('Unable to load mentors. Showing demo data.');
        }
      }
    } catch (err) {
      // Network error - set fallback mode
      setApiWorks(false);
      setError('Server is not running. Please start the backend server.');
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMentors(searchQuery);
  };

  // Demo mentors data for when API is unavailable
  const demoMentors = [
    {
      id: '1',
      name: 'Dr. Clauvet Yome',
      specialty: 'Professor of Computer Science',
      school: 'College of Technology',
      department: 'Computer Science',
      bio: 'Expert in AI and machine learning with 15 years of experience in academia and industry.'
    },
    {
      id: '2',
      name: 'Prof. Sarah Johnson',
      specialty: 'Data Science',
      school: 'Scholar Institute',
      department: 'Statistics',
      bio: 'Passionate about helping students succeed in data science careers.'
    },
    {
      id: '3',
      name: 'Dr. Michael Chen',
      specialty: 'Software Engineering',
      school: 'Tech University',
      department: 'Software Engineering',
      bio: 'Former tech lead at major companies, now mentoring students full-time.'
    },
    {
      id: '4',
      name: 'Prof. Emily Brown',
      specialty: 'Web Development',
      school: 'Digital Arts College',
      department: 'Web Technologies',
      bio: 'Full-stack developer with expertise in modern web frameworks.'
    }
  ];

  const displayMentors = apiWorks ? mentors : demoMentors;

  return (
    <div className="mentorContent my-5">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="fw-bold mb-4">Find a Mentor</h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="d-flex gap-2 mb-4">
              <input
                type="text"
                className="form-control rounded-5"
                placeholder="Search by name, specialty, or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn bg-black text-white rounded-5 px-4">
                Search
              </button>
              {searchQuery && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary rounded-5"
                  onClick={() => {
                    setSearchQuery('');
                    fetchMentors();
                  }}
                >
                  Clear
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Filters */}
        <div className="filter mb-4 fw-bold">
          <span className="me-3">Filter by:</span>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="checkbox" id="lecturers" />
            <label className="form-check-label" htmlFor="lecturers">Lecturers</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="checkbox" id="industry" />
            <label className="form-check-label" htmlFor="industry">Industry Professionals</label>
          </div>
        </div>

        {/* Error/Status Message */}
        {error && !loading && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading mentors...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && displayMentors.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No mentors found matching your criteria.</p>
          </div>
        )}

        {/* Mentor List */}
        {!loading && displayMentors.length > 0 && (
          <div className="student-mentor-matching">
            {displayMentors.map((mentor, index) => (
              <div id="mentorDesc" className="row mb-4" key={mentor.id || index}>
                <div className="col-lg-3">
                  <div id="shadow">
                    <div className="mentorIMG">
                      <img
                        className="w-100"
                        src="https://via.placeholder.com/150"
                        alt={mentor.name || 'Mentor'}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-9 p-4">
                  <div className="container">
                    <h2>{mentor.name || 'Unknown Mentor'}</h2>
                    <h5>{mentor.specialty || 'Specialty not specified'}</h5>
                    <p className="text-muted">
                      {mentor.school && `School: ${mentor.school}`}
                      {mentor.school && mentor.department && ' | '}
                      {mentor.department && `Department: ${mentor.department}`}
                    </p>
                    <p>{mentor.bio || 'No bio available'}</p>
                    <Link to={`/mentorProfileView/${mentor.id}`}>
                      <button className="btn bg-black text-white rounded-5 px-4 mt-2">
                        View Profile
                      </button>
                    </Link>
                    <Link to={`/request-mentorship/${mentor.id}`} className="ms-2">
                      <button className="btn btn-outline-primary rounded-5 px-4 mt-2">
                        Request Mentorship
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorSearch;

