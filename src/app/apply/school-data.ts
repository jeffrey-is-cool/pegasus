export type SchoolProfile = {
  acceptanceRate: number | null;
  name: string;
};

export const SCHOOL_ADMISSIONS_YEAR_LABEL = "2025 College Scorecard release";

export const SCHOOL_PROFILES = [
  { name: "Harvard University", acceptanceRate: 0.0345 },
  { name: "Stanford University", acceptanceRate: 0.0391 },
  { name: "Massachusetts Institute of Technology", acceptanceRate: 0.0474 },
  { name: "Princeton University", acceptanceRate: 0.045 },
  { name: "Yale University", acceptanceRate: 0.045 },
  { name: "University of Pennsylvania", acceptanceRate: 0.0587 },
  { name: "California Institute of Technology", acceptanceRate: 0.0314 },
  { name: "Duke University", acceptanceRate: 0.0678 },
  { name: "Brown University", acceptanceRate: 0.0523 },
  { name: "Johns Hopkins University", acceptanceRate: 0.0756 },
  { name: "Northwestern University", acceptanceRate: 0.0715 },
  { name: "Columbia University in the City of New York", acceptanceRate: 0.0423 },
  { name: "Cornell University", acceptanceRate: 0.0816 },
  { name: "University of Chicago", acceptanceRate: 0.0479 },
  { name: "University of California-Berkeley", acceptanceRate: 0.1166 },
  { name: "University of California-Los Angeles", acceptanceRate: 0.0873 },
  { name: "Rice University", acceptanceRate: 0.0788 },
  { name: "Dartmouth College", acceptanceRate: 0.0623 },
  { name: "Vanderbilt University", acceptanceRate: 0.0628 },
  { name: "University of Notre Dame", acceptanceRate: 0.1238 },
  { name: "University of Michigan-Ann Arbor", acceptanceRate: 0.1794 },
  { name: "Georgetown University", acceptanceRate: 0.1308 },
  { name: "Carnegie Mellon University", acceptanceRate: 0.114 },
  { name: "Washington University in St Louis", acceptanceRate: 0.1196 },
  { name: "Emory University", acceptanceRate: 0.111 },
  { name: "University of Virginia-Main Campus", acceptanceRate: 0.1686 },
  { name: "University of North Carolina at Chapel Hill", acceptanceRate: 0.1874 },
  { name: "University of Southern California", acceptanceRate: 0.1002 },
  { name: "New York University", acceptanceRate: 0.0941 },
  { name: "Tufts University", acceptanceRate: 0.1013 },
  { name: "Wake Forest University", acceptanceRate: 0.2156 },
  { name: "Boston College", acceptanceRate: 0.1565 },
  { name: "Georgia Institute of Technology-Main Campus", acceptanceRate: 0.1646 },
  { name: "The University of Texas at Austin", acceptanceRate: 0.2912 },
  { name: "Boston University", acceptanceRate: 0.1085 },
  { name: "Northeastern University", acceptanceRate: 0.0565 },
  { name: "Tulane University of Louisiana", acceptanceRate: 0.1459 },
  { name: "Case Western Reserve University", acceptanceRate: 0.2868 },
  { name: "Brandeis University", acceptanceRate: 0.3531 },
  { name: "University of Rochester", acceptanceRate: 0.3585 },
  { name: "Villanova University", acceptanceRate: 0.2512 },
  { name: "Lehigh University", acceptanceRate: 0.2926 },
  { name: "Rensselaer Polytechnic Institute", acceptanceRate: 0.5845 },
  { name: "University of Illinois Urbana-Champaign", acceptanceRate: 0.4369 },
  { name: "University of Wisconsin-Madison", acceptanceRate: 0.4335 },
  { name: "University of Washington-Seattle Campus", acceptanceRate: 0.4253 },
  { name: "Purdue University-Main Campus", acceptanceRate: 0.503 },
  { name: "Ohio State University-Main Campus", acceptanceRate: 0.5082 },
  { name: "Pennsylvania State University-Main Campus", acceptanceRate: 0.5422 },
  { name: "University of Maryland-College Park", acceptanceRate: 0.4484 },
  { name: "Rutgers University-New Brunswick", acceptanceRate: 0.6535 },
  { name: "University of Minnesota-Twin Cities", acceptanceRate: 0.7703 },
  { name: "Texas A & M University-College Station", acceptanceRate: 0.6325 },
  { name: "Virginia Polytechnic Institute and State University", acceptanceRate: 0.5703 },
  { name: "University of Florida", acceptanceRate: 0.2403 },
  { name: "Florida State University", acceptanceRate: 0.2538 },
  { name: "University of Miami", acceptanceRate: 0.1851 },
  { name: "University of Georgia", acceptanceRate: 0.372 },
  { name: "Indiana University-Bloomington", acceptanceRate: 0.8037 },
  { name: "Michigan State University", acceptanceRate: 0.8392 },
  { name: "North Carolina State University at Raleigh", acceptanceRate: 0.3985 },
  { name: "William & Mary", acceptanceRate: 0.3272 },
  { name: "George Washington University", acceptanceRate: 0.4354 },
  { name: "American University", acceptanceRate: 0.4738 },
  { name: "Syracuse University", acceptanceRate: 0.4169 },
  { name: "Fordham University", acceptanceRate: 0.5628 },
  { name: "Southern Methodist University", acceptanceRate: 0.6122 },
  { name: "Texas Christian University", acceptanceRate: 0.426 },
  { name: "Baylor University", acceptanceRate: 0.5099 },
  { name: "Pepperdine University", acceptanceRate: 0.4985 },
  { name: "Santa Clara University", acceptanceRate: 0.4384 },
  { name: "Loyola Marymount University", acceptanceRate: 0.4029 },
  { name: "University of California-San Diego", acceptanceRate: 0.2452 },
  { name: "University of California-Santa Barbara", acceptanceRate: 0.2778 },
  { name: "University of California-Irvine", acceptanceRate: 0.2557 },
  { name: "University of California-Davis", acceptanceRate: 0.4163 },
  { name: "University of California-Santa Cruz", acceptanceRate: 0.6254 },
  { name: "University of California-Riverside", acceptanceRate: 0.633 },
  { name: "California Polytechnic State University-San Luis Obispo", acceptanceRate: 0.2975 },
  { name: "Pomona College", acceptanceRate: 0.0676 },
  { name: "Claremont McKenna College", acceptanceRate: 0.1112 },
  { name: "Harvey Mudd College", acceptanceRate: 0.1306 },
  { name: "Swarthmore College", acceptanceRate: 0.0694 },
  { name: "Williams College", acceptanceRate: 0.0999 },
  { name: "Amherst College", acceptanceRate: 0.0982 },
  { name: "Bowdoin College", acceptanceRate: 0.0802 },
  { name: "Middlebury College", acceptanceRate: 0.1037 },
  { name: "Wellesley College", acceptanceRate: 0.1391 },
  { name: "Wesleyan University", acceptanceRate: 0.171 },
  { name: "Colgate University", acceptanceRate: 0.1195 },
  { name: "Hamilton College", acceptanceRate: 0.1177 },
  { name: "Davidson College", acceptanceRate: 0.1448 },
  { name: "Vassar College", acceptanceRate: 0.1773 },
  { name: "Barnard College", acceptanceRate: 0.0796 },
  { name: "Bates College", acceptanceRate: 0.1302 },
  { name: "Carleton College", acceptanceRate: 0.2228 },
  { name: "Grinnell College", acceptanceRate: 0.1268 },
  { name: "Haverford College", acceptanceRate: 0.1291 },
  { name: "Smith College", acceptanceRate: 0.1973 },
  { name: "The Cooper Union for the Advancement of Science and Art", acceptanceRate: 0.1905 },
] as const satisfies readonly SchoolProfile[];

function normalizeSchoolName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^the /, "")
    .trim();
}

export function findSchoolProfile(value: string) {
  const normalizedValue = normalizeSchoolName(value);

  return SCHOOL_PROFILES.find((school) => {
    const normalizedName = normalizeSchoolName(school.name);
    return (
      normalizedName === normalizedValue ||
      normalizedName.startsWith(normalizedValue) ||
      normalizedValue.startsWith(normalizedName)
    );
  });
}

export const SCHOOL_SEARCH_OPTIONS = SCHOOL_PROFILES.map((school) => school.name);
