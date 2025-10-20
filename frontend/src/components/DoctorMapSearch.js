import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Star, Navigation, Clock, Stethoscope, Filter, List } from 'lucide-react';
import { toast } from 'sonner';
import '../pages/PatientDashboard.css';

function DoctorMapSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [filteredDoctors, setFilteredDoctors] = useState([]);


    // Real healthcare facilities data that would match the Google Maps iframe
    const healthcareFacilities = [
        {
            id: 1,
            name: "Apollo Hospitals",
            type: "Multi-Specialty Hospital",
            address: "Apollo Hospitals Enterprise Ltd, Mumbai",
            rating: 4.6,
            totalRatings: 2847,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 2493 7777",
            location: "Mumbai Central",
            services: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Pediatrics"]
        },
        {
            id: 2,
            name: "Fortis Hospital",
            type: "Multi-Specialty Hospital",
            address: "Fortis Hospital, Mulund West, Mumbai",
            rating: 4.4,
            totalRatings: 1893,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 4925 4925",
            location: "Mulund West",
            services: ["Cardiology", "Neurology", "Orthopedics", "General Surgery"]
        },
        {
            id: 3,
            name: "Kokilaben Dhirubhai Ambani Hospital",
            type: "Multi-Specialty Hospital",
            address: "Kokilaben Dhirubhai Ambani Hospital, Andheri West",
            rating: 4.7,
            totalRatings: 3256,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 4269 6969",
            location: "Andheri West",
            services: ["Cardiology", "Neurology", "Oncology", "Pediatrics", "Transplant"]
        },
        {
            id: 4,
            name: "Lilavati Hospital",
            type: "Multi-Specialty Hospital",
            address: "Lilavati Hospital, Bandra West, Mumbai",
            rating: 4.5,
            totalRatings: 2156,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 2675 1000",
            location: "Bandra West",
            services: ["Cardiology", "Neurology", "Orthopedics", "General Medicine"]
        },
        {
            id: 5,
            name: "Tata Memorial Hospital",
            type: "Specialized Cancer Hospital",
            address: "Tata Memorial Hospital, Parel, Mumbai",
            rating: 4.8,
            totalRatings: 4123,
            openNow: true,
            specialization: "Oncology",
            phone: "+91 22 2417 7000",
            location: "Parel",
            services: ["Medical Oncology", "Surgical Oncology", "Radiation Oncology", "Palliative Care"]
        },
        {
            id: 6,
            name: "Breach Candy Hospital",
            type: "Multi-Specialty Hospital",
            address: "Breach Candy Hospital Trust, Breach Candy, Mumbai",
            rating: 4.3,
            totalRatings: 1567,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 2367 1888",
            location: "Breach Candy",
            services: ["Cardiology", "Neurology", "Orthopedics", "General Surgery"]
        },
        {
            id: 7,
            name: "Jaslok Hospital",
            type: "Multi-Specialty Hospital",
            address: "Jaslok Hospital, Pedder Road, Mumbai",
            rating: 4.4,
            totalRatings: 1987,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 6657 3000",
            location: "Pedder Road",
            services: ["Cardiology", "Neurology", "Orthopedics", "General Medicine"]
        },
        {
            id: 8,
            name: "Bombay Hospital",
            type: "Multi-Specialty Hospital",
            address: "Bombay Hospital, Marine Lines, Mumbai",
            rating: 4.2,
            totalRatings: 1345,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 2206 7676",
            location: "Marine Lines",
            services: ["Cardiology", "Neurology", "Orthopedics", "General Surgery"]
        },
        {
            id: 9,
            name: "Saifee Hospital",
            type: "Multi-Specialty Hospital",
            address: "Saifee Hospital, Charni Road, Mumbai",
            rating: 4.1,
            totalRatings: 987,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 6757 0111",
            location: "Charni Road",
            services: ["Cardiology", "Neurology", "Orthopedics", "General Medicine"]
        },
        {
            id: 10,
            name: "Wockhardt Hospital",
            type: "Multi-Specialty Hospital",
            address: "Wockhardt Hospital, Central Avenue, Mumbai",
            rating: 4.3,
            totalRatings: 1123,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 6178 4444",
            location: "Central Avenue",
            services: ["Cardiology", "Neurology", "Orthopedics", "General Surgery"]
        },
        {
            id: 11,
            name: "Dr. L.H. Hiranandani Hospital",
            type: "Multi-Specialty Hospital",
            address: "Dr. L.H. Hiranandani Hospital, Powai, Mumbai",
            rating: 4.5,
            totalRatings: 1876,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 2576 7000",
            location: "Powai",
            services: ["Cardiology", "Neurology", "Orthopedics", "General Medicine"]
        },
        {
            id: 12,
            name: "SevenHills Hospital",
            type: "Multi-Specialty Hospital",
            address: "SevenHills Hospital, Andheri East, Mumbai",
            rating: 4.0,
            totalRatings: 756,
            openNow: true,
            specialization: "Multi-Specialty",
            phone: "+91 22 6767 6767",
            location: "Andheri East",
            services: ["Cardiology", "Neurology", "Orthopedics", "General Surgery"]
        }
    ];

    useEffect(() => {
        setDoctors(healthcareFacilities);
        setFilteredDoctors(healthcareFacilities);
    }, []);

    const searchFacilities = () => {
        if (!searchQuery.trim()) {
            setFilteredDoctors(healthcareFacilities);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = healthcareFacilities.filter(facility => 
            facility.name.toLowerCase().includes(query) ||
            facility.type.toLowerCase().includes(query) ||
            facility.specialization.toLowerCase().includes(query) ||
            facility.location.toLowerCase().includes(query) ||
            facility.address.toLowerCase().includes(query) ||
            facility.services.some(service => service.toLowerCase().includes(query))
        );

        setFilteredDoctors(filtered);
        
        if (filtered.length === 0) {
            toast.info('No healthcare facilities found for your search. Try a different term.');
        } else {
            toast.success(`Found ${filtered.length} healthcare facility(ies) matching your search`);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchFacilities();
    };

    const clearSearch = () => {
        setSearchQuery('');
        setFilteredDoctors(healthcareFacilities);
    };

    const getDirections = (facility) => {
        const address = encodeURIComponent(facility.address);
        const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
        window.open(url, '_blank');
    };

    const callFacility = (facility) => {
        toast.info(`Calling ${facility.name} at ${facility.phone}...`);
        // In a real app, you might want to initiate a phone call or show contact options
    };



    return (
        <div className="card doctor-map-search-card">
            <div className="card-header">
                <h2 className="card-title">Find Nearby Healthcare Facilities</h2>
                <MapPin size={20} color="#0f766e" />
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search 
                        size={16} 
                        style={{ 
                            position: 'absolute', 
                            left: 12, 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: '#6b7280'
                        }} 
                    />
                    <input
                        className="input"
                        type="text"
                        placeholder="Search for hospitals, clinics, or specialties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: 40 }}
                    />
                </div>
                <button 
                    type="submit"
                    className="btn btn-primary" 
                    disabled={!searchQuery.trim() || loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
                {searchQuery && (
                    <button 
                        type="button"
                        className="btn btn-outline" 
                        onClick={clearSearch}
                    >
                        Clear
                    </button>
                )}
            </form>



            {/* Google Maps Iframe */}
            <div className="doctor-map-frame">
                <iframe 
                    src="https://www.google.com/maps/d/embed?mid=1-zFwjsC3nnQqB2JswXkxVL9tMZBFz2o&ehbc=2E312F" 
                    width="100%" 
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Healthcare Facilities Map"
                />
            </div>



            {/* No Results */}
            {filteredDoctors.length === 0 && searchQuery && !loading && (
                <div className="doctor-map-no-results">
                    <Search size={48} />
                    <p>No healthcare facilities found for "{searchQuery}"</p>
                    <p style={{ fontSize: '14px', marginTop: 8 }}>
                        Try searching for different hospital names, specialties, or locations
                    </p>
                    <button 
                        className="btn btn-outline"
                        onClick={clearSearch}
                        style={{ marginTop: 16 }}
                    >
                        View All Facilities
                    </button>
                </div>
            )}

            {/* Selected Facility Details */}
            {selectedDoctor && (
                <div className="card" style={{ marginTop: 16, borderColor: '#0f766e' }}>
                    <div className="card-header">
                        <h3 className="card-title">Healthcare Facility Details</h3>
                    </div>
                    <div style={{ padding: 16 }}>
                        <h4 style={{ marginBottom: 8 }}>{selectedDoctor.name}</h4>
                        <p style={{ color: '#6b7280', marginBottom: 4, fontWeight: '500' }}>
                            {selectedDoctor.type}
                        </p>
                        <p style={{ color: '#6b7280', marginBottom: 12 }}>
                            <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
                            {selectedDoctor.address}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4,
                                color: '#f59e0b',
                                fontSize: '14px'
                            }}>
                                <Star size={14} fill="#f59e0b" />
                                {selectedDoctor.rating} ({selectedDoctor.totalRatings} ratings)
                            </span>
                            <span style={{ 
                                color: selectedDoctor.openNow ? '#10b981' : '#ef4444',
                                fontSize: '14px'
                            }}>
                                • {selectedDoctor.openNow ? 'Open Now' : 'Closed'}
                            </span>
                        </div>
                        <div style={{ 
                            background: '#f9fafb', 
                            padding: '12px', 
                            borderRadius: '6px',
                            marginBottom: 16,
                            fontSize: '14px'
                        }}>
                            <strong>Services:</strong> {selectedDoctor.services.join(', ')}
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            <button 
                                className="btn btn-primary"
                                onClick={() => getDirections(selectedDoctor)}
                            >
                                <Navigation size={16} />
                                Get Directions
                            </button>
                            <button 
                                className="btn btn-outline"
                                onClick={() => callFacility(selectedDoctor)}
                            >
                                <Phone size={16} />
                                Call Facility
                            </button>
                        </div>
                        <div style={{ 
                            background: '#f9fafb', 
                            padding: '12px', 
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}>
                            <strong>Phone:</strong> {selectedDoctor.phone}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorMapSearch;
