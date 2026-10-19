/**
 * Central, editable site content.
 *
 * Everything public about Zakia Batool Najafi lives here. Only confirmed
 * information belongs in this file. Leave a field as `null` until the client
 * supplies it — the page hides anything that is not filled in.
 */

export type SocialLink = { label: string; handle: string; href: string };

export type Course = {
  title: string;
  /** Short description. `null` until supplied. */
  description: string | null;
  /** e.g. "Sundays, 7:00 pm (UK time), twelve weeks". */
  schedule: string | null;
  /** e.g. "Online via Zoom" or "In person". */
  format: string | null;
  /** e.g. "Enrolment open", "Enrolment closed". */
  enrolment: string | null;
  /** How to join, e.g. "Write by email to request a place." */
  registration: string | null;
};

export const site = {
  name: "Zakia Batool Najafi",
  qualification: "Master's in Islamic Sciences",

  /** Used for canonical URLs, sitemap and Open Graph. Set NEXT_PUBLIC_SITE_URL in production. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  description:
    "Zakia Batool Najafi — Master's in Islamic Sciences. Islamic lectures and majalis, Hawzah courses, Tafseer classes and consultation.",

  /** One or two sentences shown in the introduction. */
  introduction:
    "Teacher of Islamic sciences, delivering lectures and majalis, Hawzah courses and Tafseer classes. Upcoming online lectures are announced here and open for registration.",

  /**
   * Optional short line shown beside the portrait (one phrase per line), e.g. a
   * motto the client approves. Left empty: no wording has been supplied.
   */
  heroTagline: [] as string[],

  /**
   * Biography paragraphs. None has been supplied yet; the About section falls
   * back to a short factual summary while this is empty.
   */
  biography: [] as string[],

  /**
   * Hero photograph: the portrait used on her official YouTube thumbnails for
   * the Muharram 1448 majalis (1st Majlis, 17 June 2026 —
   * youtube.com/watch?v=DmzziMGF-a4), cropped above the poster's lettering.
   * The source is 424×530; replace with the original photograph at full
   * resolution when the client supplies it.
   */
  portrait: {
    src: "/images/portrait-muharram-1448.jpg",
    alt: "Zakia Batool Najafi",
    width: 424,
    height: 530,
  } as null | { src: string; alt: string; width: number; height: number; caption?: string },

  /**
   * Approved ZB monogram. The supplied original is kept at
   * /brand/zb-logo-original.webp; the transparent variants and the favicons are
   * generated from it by scripts/make-logo-assets.py.
   */
  logo: {
    onLight: { src: "/brand/zb-mark-on-light.png", width: 844, height: 710 },
    onDark: { src: "/brand/zb-mark-on-dark.png", width: 844, height: 710 },
  },

  /** Contact email. Not supplied yet — email links stay hidden until it is set. */
  email: null as string | null,

  social: [
    { label: "YouTube", handle: "@zakianajafi", href: "https://www.youtube.com/@zakianajafi" },
    { label: "Instagram", handle: "@zakiabatoolnajafi", href: "https://www.instagram.com/zakiabatoolnajafi/" },
    {
      label: "Facebook",
      handle: "Zakia Batool Najafi",
      href: "https://www.facebook.com/Zakia-Batool-Najafi-101627131442352/",
    },
    { label: "X", handle: "@NajafiZakia", href: "https://twitter.com/NajafiZakia" },
    { label: "Threads", handle: "@zakiabatoolnajafi", href: "https://www.threads.net/@zakiabatoolnajafi" },
  ] satisfies SocialLink[],

  youtubeChannel: "https://www.youtube.com/@zakianajafi",

  courses: [
    {
      title: "Hawzah courses",
      description: null,
      schedule: null,
      format: null,
      enrolment: null,
      registration: null,
    },
    {
      title: "Tafseer classes",
      description: null,
      schedule: null,
      format: null,
      enrolment: null,
      registration: null,
    },
  ] satisfies Course[],

  consultation: {
    /** Scope, format and availability of consultations. `null` until supplied. */
    details: null as string | null,
  },
};
