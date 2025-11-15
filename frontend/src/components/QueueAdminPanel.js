import React, { useState } from "react";
import { toast } from "sonner";
import API from "../api";
import { queueBus } from "../lib/eventBus";

function QueueAdminPanel({ facilityId }) {
  const [nowServing, setNowServing] = useState(10);
  const [eta, setEta] = useState(5);
  const [emergency, setEmergency] = useState(false);
  const [loading, setLoading] = useState(false);

  const publish = async () => {
    if (!facilityId) return toast.error("Facility ID missing!");

    try {
      setLoading(true);

      // 1️⃣ Update in backend database
      await API.put(`/queue/${facilityId}/update`, {
        nowServing,
        eta,
        emergency,
      });

      // 2️⃣ Publish instant update so UI reacts without refresh
      queueBus.publishQueueUpdate({ nowServing, eta, emergency });

      toast.success("Queue updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Failed to update queue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <h3 className="card-title">Update Queue</h3>

      <div className="form-field">
        <label className="label">Now Serving</label>
        <input
          className="input"
          type="number"
          value={nowServing}
          onChange={(e) => setNowServing(parseInt(e.target.value || 0, 10))}
        />
      </div>

      <div className="form-field">
        <label className="label">Estimated Waiting Time (min)</label>
        <input
          className="input"
          type="number"
          value={eta}
          onChange={(e) => setEta(parseInt(e.target.value || 0, 10))}
        />
      </div>

      <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={emergency}
          onChange={(e) => setEmergency(e.target.checked)}
        />
        Emergency overload
      </label>

      <button className="btn btn-primary" disabled={loading} onClick={publish}>
        {loading ? "Updating..." : "Publish Update"}
      </button>
    </div>
  );
}

export default QueueAdminPanel;
