// middleware/prioritizeSOS.js
import { computePriority } from '../utils/prioritizer.js';
import { classifySOS } from '../utils/classifier.js'; // <-- we'll make this

export async function attachPriorityOnCreate(req, res, next) {
  try {
    let { severity, immediacy, vulnerability, credibility, escalation } = req.body || {};

    // If factors aren’t provided, classify from description
    if (!severity && !immediacy && !vulnerability) {
      const categories = await classifySOS(req.body.description || "");
      severity      = categories.severity;
      immediacy     = categories.immediacy;
      vulnerability = categories.vulnerability;
      credibility   = categories.credibility;
      escalation    = categories.escalation;
    }

    req.body.priority = computePriority({
      severity, immediacy, vulnerability, credibility, escalation
    });

    next();
  } catch (err) {
    console.error("Priority classification failed:", err.message);
    req.body.priority = computePriority({
      severity: "low",
      immediacy: "low",
      vulnerability: "adult",
      credibility: "low",
      escalation: "first"
    });
    next();
  }
}
