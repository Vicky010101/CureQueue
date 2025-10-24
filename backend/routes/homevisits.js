const express = require("express");
const router = express.Router();
const HomeVisit = require("../models/HomeVisit");
const { auth, roleCheck } = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const { doctorId, address, reason, date, location } = req.body;
    
    if (!doctorId || !address || !reason || !date) {
      return res.status(400).json({ msg: "Missing required fields" });
    }
    
    const hv = await HomeVisit.create({ 
      patientId: req.user.id, 
      doctorId,
      address, 
      reason,
      date,
      location: location || {},
      status: "Pending" 
    });
    
    await hv.populate('patientId', 'name');
    res.status(201).json({ request: hv, msg: "Home Visit Request Submitted Successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", auth, roleCheck("admin"), async (_req, res) => {
  try {
    const list = await HomeVisit.find().sort({ createdAt: -1 });
    res.json({ requests: list });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get home visit requests for a specific doctor
router.get("/doctor/:doctorId", auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Ensure the requesting user is the doctor or has permission
    if (req.user.id !== doctorId && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }
    
    const requests = await HomeVisit.find({ doctorId })
      .populate('patientId', 'name email phone mobile')
      .sort({ date: 1 });
      
    res.json({ requests });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get home visit requests for a specific patient
router.get("/patient/:patientId", auth, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Ensure the requesting user is the patient or has permission
    if (req.user.id !== patientId && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }
    
    const requests = await HomeVisit.find({ patientId })
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });
      
    res.json({ requests });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Doctor accepts a home visit request
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const homeVisit = await HomeVisit.findById(req.params.id);
    
    if (!homeVisit) {
      return res.status(404).json({ msg: "Home visit request not found" });
    }
    
    // Ensure the requesting user is the assigned doctor
    if (req.user.id !== homeVisit.doctorId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }
    
    homeVisit.status = "Accepted";
    await homeVisit.save();
    
    await homeVisit.populate('patientId', 'name email');
    res.json({ request: homeVisit, msg: "Home visit request accepted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Doctor rejects a home visit request
router.put("/:id/reject", auth, async (req, res) => {
  try {
    const homeVisit = await HomeVisit.findById(req.params.id);
    
    if (!homeVisit) {
      return res.status(404).json({ msg: "Home visit request not found" });
    }
    
    // Ensure the requesting user is the assigned doctor
    if (req.user.id !== homeVisit.doctorId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }
    
    homeVisit.status = "Rejected";
    await homeVisit.save();
    
    await homeVisit.populate('patientId', 'name email');
    res.json({ request: homeVisit, msg: "Home visit request rejected" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Doctor marks home visit as completed
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const homeVisit = await HomeVisit.findById(req.params.id);
    
    if (!homeVisit) {
      return res.status(404).json({ msg: "Home visit request not found" });
    }
    
    // Ensure the requesting user is the assigned doctor
    if (req.user.id !== homeVisit.doctorId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }
    
    homeVisit.status = "Completed";
    await homeVisit.save();
    
    await homeVisit.populate('patientId', 'name email');
    res.json({ request: homeVisit, msg: "Home visit marked as completed" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Patient cancels their home visit request
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const homeVisit = await HomeVisit.findById(req.params.id);
    
    if (!homeVisit) {
      return res.status(404).json({ msg: "Home visit request not found" });
    }
    
    // Ensure the requesting user is the patient who created the request
    if (req.user.id !== homeVisit.patientId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }
    
    // Don't allow cancellation of completed visits
    if (homeVisit.status === "Completed") {
      return res.status(400).json({ msg: "Cannot cancel a completed visit" });
    }
    
    homeVisit.status = "Cancelled";
    await homeVisit.save();
    
    await homeVisit.populate('doctorId', 'name email');
    res.json({ request: homeVisit, msg: "Home visit request cancelled" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin only - update any status
router.post("/:id/status", auth, roleCheck("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await HomeVisit.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ request: updated });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;











