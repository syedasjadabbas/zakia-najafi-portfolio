/**
 * Recorded lectures from the official YouTube channel (youtube.com/@zakianajafi).
 * Titles, durations and IDs were taken from the channel's public videos page.
 * `title` is the exact YouTube title; the other fields are read from it.
 * Where a title gives no calendar date, `date` is the upload date, marked as such.
 * The first entry is featured; the rest are listed newest first.
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
    id: "yRng8AdJqR4",
    title: "Majlis e Shahadat Bibi Sakina s.a. | 9th Safar 1448 | Karachi | Zakia Batool Najafi",
    label: "Majlis-e-Shahadat Bibi Sakina (s.a.)",
    occasion: "9th Safar 1448",
    venue: "Karachi",
    date: "Uploaded 25 July 2026",
    duration: "54:40",
  },
  {
    id: "IlAv7-rH_gI",
    title: "9th Majlis | Zakia Batool Najafi | 25th June 2026 | Muharram 1448 AH | KSIMC Birmingham UK",
    label: "9th Majlis",
    occasion: "Muharram 1448",
    venue: "KSIMC Birmingham, UK",
    date: "25 June 2026",
    duration: "58:01",
  },
  {
    id: "2UZojQYk6Go",
    title: "8th Majlis | Zakia Batool Najafi | 24th June 2026 | Muharram 1448AH | KSIMC Birmingham UK",
    label: "8th Majlis",
    occasion: "Muharram 1448",
    venue: "KSIMC Birmingham, UK",
    date: "24 June 2026",
    duration: "1:02:53",
  },
  {
    id: "dyq6XOqrEtA",
    title: "7th Majilis, Zakia Batool Najafi | 23rd June 2026 | Muharram 1448 AH | KSIMC Birmingham UK",
    label: "7th Majlis",
    occasion: "Muharram 1448",
    venue: "KSIMC Birmingham, UK",
    date: "23 June 2026",
    duration: "1:00:12",
  },
  {
    id: "bt1ylUJNTzU",
    title: "6th Majlis | Zakia Batool Najafi | 22 June 2026 | Muharram 2026 | KSIMC Birmingham UK",
    label: "6th Majlis",
    occasion: "Muharram 1448",
    venue: "KSIMC Birmingham, UK",
    date: "22 June 2026",
    duration: "58:22",
  },
  {
    id: "6YE7Rouh5tI",
    title: "5th Majlis | Zakia Batool Najafi | 21st June 2026 | KSIMC Birmingham UK | 5th Muharram 1448 AH",
    label: "5th Majlis",
    occasion: "Muharram 1448",
    venue: "KSIMC Birmingham, UK",
    date: "21 June 2026",
    duration: "1:02:17",
  },
  {
    id: "4Qa8zXRl0qo",
    title: "4th Majlis | Zakia Batool Najafi | 20th June 2026 | KSIMC Birmingham UK | 4th Muharram 1448 AH",
    label: "4th Majlis",
    occasion: "Muharram 1448",
    venue: "KSIMC Birmingham, UK",
    date: "20 June 2026",
    duration: "49:55",
  },
  {
    id: "NEbP26zAs6s",
    title: "3rd Majlis | Zakia Batool Najafi | 19th June 2026 | KSIMC Birmingham UK | 3rd Muharram 1448 AH",
    label: "3rd Majlis",
    occasion: "Muharram 1448",
    venue: "KSIMC Birmingham, UK",
    date: "19 June 2026",
    duration: "46:54",
  },
  {
    id: "UvIcLJdGBNk",
    title: "2nd Majlis | Zakia Batool Najafi | 18th June 2026 | KSIMC Birmingham UK |  2nd Muharram 1448 AH",
    label: "2nd Majlis",
    occasion: "Muharram 1448",
    venue: "KSIMC Birmingham, UK",
    date: "18 June 2026",
    duration: "57:25",
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
    id: "x7FXPPui4F8",
    title: "The Measure of A Prayer",
    label: "The Measure of a Prayer",
    occasion: null,
    venue: null,
    date: "Uploaded 1 August 2026",
    duration: "2:46",
  },
  {
    id: "axyocgRCQ-0",
    title: "4th Majlis | Zakia Batool Najafi | 26th Sep 2022 | Safar 1444 AH | MWA",
    label: "4th Majlis",
    occasion: "Safar 1444",
    venue: "MWA",
    date: "26 September 2022",
    duration: "1:13:50",
  },
  {
    id: "vTXe_Vp_10U",
    title: "3rd Majlis | Zakia Batool Najafi | 25th Sep 2022 | Safar 1444 AH | MWA",
    label: "3rd Majlis",
    occasion: "Safar 1444",
    venue: "MWA",
    date: "25 September 2022",
    duration: "1:08:02",
  },
  {
    id: "4EuzSCBNX0Q",
    title: "2nd Majlis | Zakia Batool Najafi | 24th Sep 2022 | Safar 1444 AH | MWA",
    label: "2nd Majlis",
    occasion: "Safar 1444",
    venue: "MWA",
    date: "24 September 2022",
    duration: "59:45",
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
