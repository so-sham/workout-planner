/**
 * @module components/Icon
 * @description Inline SVG icon component.
 * Renders lightweight, stroke-based icons without any external icon library.
 * Each icon is a hand-crafted SVG path matching the app's visual language.
 *
 * @param {Object} props
 * @param {string} props.name - Icon identifier (e.g. "flame", "dumbbell", "chart")
 * @param {string} [props.className="w-5 h-5"] - Tailwind size classes
 * @returns {JSX.Element|null} SVG element or null for unknown icons
 */
export default function Icon({ name, className = "w-5 h-5" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "dumbbell":
      return <svg {...common}><path d="M6 8v8M2 10v4M10 6v12M14 6v12M18 8v8M22 10v4" /></svg>;
    case "flame":
      return <svg {...common}><path d="M12 2s1 3 3 5-1 5 1 7a4 4 0 1 1-8 0c0-3 2-4 2-7 0-2 2-5 2-5z" /></svg>;
    case "history":
      return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 7v5l4 2" /></svg>;
    case "chart":
      return <svg {...common}><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></svg>;
    case "calendar":
      return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    case "pencil":
      return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
    case "save":
      return <svg {...common}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
    case "settings":
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1c.4.6 1 1 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
    case "play":
      return <svg {...common}><polygon points="6 3 20 12 6 21 6 3" /></svg>;
    case "x":
      return <svg {...common}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    case "swap":
      return <svg {...common}><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>;
    case "plus":
      return <svg {...common}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case "check":
      return <svg {...common}><polyline points="20 6 9 17 4 12" /></svg>;
    case "trash":
      return <svg {...common}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>;
    case "trophy":
      return <svg {...common}><path d="M8 21h8M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M17 5h2a2 2 0 0 1 0 4h-2M7 5H5a2 2 0 0 0 0 4h2" /></svg>;
    case "bolt":
      return <svg {...common}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case "copy":
      return <svg {...common}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
    default:
      return null;
  }
}
