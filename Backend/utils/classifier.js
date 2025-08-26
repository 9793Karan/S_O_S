// utils/classifier.js
export async function classifySOS(description) {
  const text = description.toLowerCase();

  let severity = "low";
  if (text.includes("fire") || text.includes("gun") || text.includes("explosion")) severity = "high";
  if (text.includes("accident") || text.includes("injury")) severity = "medium";

  let immediacy = "moderate";
  if (text.includes("now") || text.includes("urgent") || text.includes("immediately")) immediacy = "critical";
  if (text.includes("tomorrow") || text.includes("later")) immediacy = "low";

  let vulnerability = "adult";
  if (text.includes("child") || text.includes("baby")) vulnerability = "child";
  if (text.includes("elderly") || text.includes("senior")) vulnerability = "elderly";
  if (text.includes("disabled") || text.includes("wheelchair")) vulnerability = "disabled";

  let credibility = "medium"; // can upgrade if police/hospital verifies
  if (text.includes("confirmed") || text.includes("verified")) credibility = "high";

  let escalation = text.includes("again") || text.includes("repeated") ? "repeated" : "first";

  return { severity, immediacy, vulnerability, credibility, escalation };
}
