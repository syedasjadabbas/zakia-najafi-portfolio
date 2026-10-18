/**
 * Recorded lectures from the official YouTube channel (youtube.com/@zakianajafi).
 * Titles, durations and IDs were taken from the channel's public videos page.
 * `title` is the exact YouTube title; the other fields are read from it.
 * The first entry is featured with an inline player.
 */

export type Video = {
  id: string;
  title: string;
  label: string;
  occasion: string | null;
  venue: string | null;
  date: string;
  duration: string;
  /** Optional self-hosted still in /public; otherwise the YouTube thumbnail is used. */
  image?: string;
};

export const videos: Video[] = [
  {
    id: "imcwWeJtgTg",
    title: "10th Majlis | Zakia Batool Najafi | 27 June 2026 | 11th Muharram 1448 | KSIMC Birmingham UK",
    label: "10th Majlis",
    occasion: "Muharram 1448",
    venue: "KSIMC Birmingham, UK",
    date: "27 June 2026",
    duration: "1:05:02",
    image: "/images/majlis-10-muharram-1448.jpg",
  },
  {
    id: "fBUOMFuhSDk",
    title: "18th Safar Majilis | Zakira Zakia Batool Najafi | 2nd August 2026",
    label: "18th Safar Majlis",
    occasion: null,
    venue: null,
    date: "2 August 2026",
    duration: "1:00:09",
  },
  {
    id: "DmzziMGF-a4",
    title: "1st Majlis | Zakia Batool Najafi | 17th June 2026 | KSIMC Birmingham UK |  Muharram 1448 AH",
    label: "1st Majlis",
    occasion: "Muharram 1448",
    venue: "KSIMC Birmingham, UK",
    date: "17 June 2026",
    duration: "45:46",
  },
  {
    id: "NnwyiSF1gCk",
    title: "1st Majlis | Zakia Batool Najafi | 23rd Sep 2022 | Safar 1444 AH | MWA",
    label: "1st Majlis",
    occasion: "Safar 1444",
    venue: "MWA",
    date: "23 September 2022",
    duration: "1:23:46",
  },
];
