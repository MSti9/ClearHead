/**
 * Spillway palette — Industrial Calm direction from
 * ClearHead_Locked_Decisions_v4_Renamed_Spillway.md (lines 449–465).
 *
 * This is the first migration. Only screens in the core flow
 * (welcome → home → record/new-entry → reflection) consume these
 * tokens today. Other screens still render in the legacy warm
 * palette during the transition.
 */

export const SpillwayColors = {
  // Surfaces
  graphite: '#111111',          // deepest canvas — primary screen background
  charcoal: '#1B1A18',          // raised surface — cards, tab bar, modals
  border: '#2A2926',            // subtle low-contrast border on dark surfaces

  // Text
  bone: '#F4EFE7',              // primary text on dark surfaces
  textLight: '#F7F2EA',         // slightly brighter bone for hero text
  mutedText: '#8D8982',         // warm gray — labels, secondary text

  // Accents (the "pilot light", never the "construction sign")
  ember: '#B86A3C',             // primary accent — Let it go, brand mark
  amber: '#C9833A',             // muted amber variant — sparing use
  stoneSage: '#6E7568',         // settled stone/sage — secondary actions

  // Reserved for the safety branch — keeps a held, warm-but-grounded tone
  // against the dark base. v4 line 338: "calm and grounded — held, not alarmed."
  safetySurface: '#1F1A14',
  safetyBorder: '#3F2E22',
  safetyAccent: '#C9833A',
} as const;

export type SpillwayColorName = keyof typeof SpillwayColors;
