import React, { useState, useEffect } from "react";
import { CalendarDays, Clock, User, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import API from "../api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, past, cancelled

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await API.get("/appointments/me");
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} color="#10b981" />;
      case 'completed':
        return <CheckCircle size={16} color="#059669" />;
      case 'cancelled':
        return <XCircle size={16} color="#ef4444" />;
      case 'pending':
        return <AlertCircle size={16} color="#f59e0b" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'badge-green';
      case 'completed':
        return 'badge-blue';
      case 'cancelled':
        return 'badge-red';
      case 'pending':
        return 'badge-yellow';
      default:
        return 'badge';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const today = new Date();
    const appointmentDate = new Date(apt.date);
    
    switch (filter) {
      case 'upcoming':
        return appointmentDate >= today && apt.status !== 'cancelled';
      case 'past':
        return appointmentDate < today;
      case 'cancelled':
        return apt.status === 'cancelled';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="container-responsive" style={{ paddingTop: 24 }}>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="container-responsive" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">View and manage your scheduled appointments.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({appointments.length})
          </button>
          <button 
            className={`btn ${filter === 'upcoming' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({appointments.filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'cancelled').length})
          </button>
          <button 
            className={`btn ${filter === 'past' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('past')}
          >
            Past ({appointments.filter(apt => new Date(apt.date) < new Date()).length})
          </button>
          <button 
            className={`btn ${filter === 'cancelled' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled ({appointments.filter(apt => apt.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: "center", padding: 32 }}>
            <CalendarDays size={48} color="#9ca3af" />
            <h3 style={{ marginTop: 16, marginBottom: 8 }}>No appointments found</h3>
            <p className="text-muted">
              {filter === 'all' ? "You don't have any appointments yet." :
               filter === 'upcoming' ? "No upcoming appointments." :
               filter === 'past' ? "No past appointments." :
               "No cancelled appointments."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-1" style={{ gap: 16 }}>
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    {getStatusIcon(appointment.status)}
                    <h3 style={{ margin: 0 }}>{appointment.doctorName || appointment.doctor || "Doctor"}</h3>
                    <span className={`badge ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CalendarDays size={16} color="#6b7280" />
                      <span className="text-muted">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={16} color="#6b7280" />
                      <span className="text-muted">{appointment.time}</span>
                    </div>
                    
                    {appointment.token && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <User size={16} color="#6b7280" />
                        <span className="text-muted">Token: {appointment.token}</span>
                      </div>
                    )}
                    
                    {appointment.waitingTime > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Clock size={16} color="#0f766e" />
                        <span style={{ color: '#0f766e', fontWeight: 500 }}>
                          Estimated wait: {appointment.waitingTime} minutes
                        </span>
                      </div>
                    )}
                    
                    {appointment.reason && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <MapPin size={16} color="#6b7280" style={{ marginTop: 2 }} />
                        <span className="text-muted">{appointment.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Appointments;



