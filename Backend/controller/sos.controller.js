import SOS from "../models/sos.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { io, onlineResponders } from "../index.js";
import { computePriority } from "../utils/prioritizer.js";

export const createSOS = async (req, res) => {
  try {
    const { description, location } = req.body;
    if (!location || !location.coordinates) {
      return res.status(400).json({ message: "Location required" });
    }

    // Fallback: if middleware didn’t attach priority, compute it here
    let { priority } = req.body;
    if (!priority) {
      const {
        severity,      // "high" | "medium" | "low"
        immediacy,     // "critical" | "moderate" | "low"
        vulnerability, // "child" | "elderly" | "disabled" | "adult" | "minor"
        credibility,   // "verified" | "high" | "medium" | "low"
        escalation     // "repeated" | "first" | "addressed"
      } = req.body || {};
      priority = computePriority({ severity, immediacy, vulnerability, credibility, escalation });
    }

    // Expect priority: { score, tag, color, factors:{S,T,V,C,E} }
    const priorityScore   = priority?.score ?? 0;
    const priorityTag     = priority?.tag ?? "Minimal";
    const priorityColor   = priority?.color ?? "#0A84FF";
    const priorityFactors = priority?.factors ?? { S:0, T:0, V:0, C:0, E:0 };

    const sos = new SOS({
      user: req.user._id,
      description,
      location,
      priorityScore,
      priorityTag,
      priorityColor,
      priorityFactors
    });

    await sos.save();

    const responders = await User.find({
      role: "responder",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: location.coordinates },
          $maxDistance: 10000
        }
      }
    });

    for (const r of responders) {
      const notification = new Notification({
        sos: sos._id,
        responder: r._id,
        message: `New SOS from ${req.user.name}`
      });
      await notification.save();

      const socketId = onlineResponders.get(r._id.toString());
      if (socketId) {
        io.to(socketId).emit("newSOS", { sos, notification });
      }
    }

    return res.status(201).json({ message: "SOS created", sos });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllSOS = async (req, res) => {
  try {
    const docs = await SOS.find()
      .populate("user", "name email")
      .populate("responder", "name email phone");

    // Ensure priority exists on every record sent to the client
    const sosList = docs.map(doc => {
      const obj = doc.toObject();
      if (typeof obj.priorityScore !== "number") {
        // If legacy record has no priority, compute minimal defaults
        const computed = computePriority({
          severity: "low",
          immediacy: "low",
          vulnerability: "minor",
          credibility: "low",
          escalation: "first"
        });
        obj.priorityScore = computed.score;
        obj.priorityTag = computed.tag;
        obj.priorityColor = computed.color;
        obj.priorityFactors = computed.factors;
      }
      return obj;
    });

    return res.json(sosList);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateSOSStatus = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    sos.status = req.body.status;

    if (req.body.status === "handled" && req.user.role === "responder") {
      sos.responder = req.user._id;
    }

    await sos.save();

    return res.json({ message: "SOS status updated", sos });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
