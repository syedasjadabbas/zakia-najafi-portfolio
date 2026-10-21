/** Time zones offered when publishing a lecture. Pakistan first, as the default. */
export const lectureTimeZones = [
  { id: "Asia/Karachi", label: "Pakistan (PKT)" },
  { id: "Europe/London", label: "United Kingdom" },
  { id: "Asia/Dubai", label: "UAE" },
  { id: "Asia/Riyadh", label: "Saudi Arabia" },
  { id: "Asia/Kolkata", label: "India" },
  { id: "Europe/Berlin", label: "Central Europe" },
  { id: "America/New_York", label: "US / Canada Eastern" },
  { id: "America/Chicago", label: "US Central" },
  { id: "America/Los_Angeles", label: "US / Canada Pacific" },
  { id: "Australia/Sydney", label: "Australia (Sydney)" },
] as const;
