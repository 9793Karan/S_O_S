export default function PriorityBadge({ tag, color, score }) {
  const bg = color || "#0A84FF";
  return (
    <span
      style={{
        backgroundColor: bg,
        color: "#000",
        borderRadius: 12,
        padding: "2px 8px",
        fontWeight: 600,
        fontSize: 12,
        display: "inline-block",
        minWidth: 80,
        textAlign: "center"
      }}
      aria-label={`Priority ${tag} score ${Number(score || 0).toFixed(2)}`}
    >
      {tag} • {Number(score || 0).toFixed(2)}
    </span>
  );
}
