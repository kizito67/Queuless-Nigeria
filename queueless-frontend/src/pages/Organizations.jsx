import { useState, useEffect } from "react";
import PageHero from "../components/PageHero";
import StatusPill from "../components/StatusPill";
import { api } from "../api";

const categories = [
  "All",
  "Bank",
  "Hospital",
  "Clinic",
  "Government agency",
  "University",
  "Utility company",
  "Insurance company",
  "Telecom office",
  "Other",
];

function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // useEffect with [] runs once, right after the page first appears.
  // This is where data fetching belongs: not in the component body,
  // which would re-fetch on every re-render.
  useEffect(() => {
    api("/api/organizations")
      .then((data) => setOrganizations(data.organizations))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = organizations.filter((org) => {
    const text = (
      org.name +
      " " +
      org.services.map((s) => s.name).join(" ")
    ).toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesCategory = category === "All" || org.category === category;
    return matchesSearch && matchesCategory;
  });

  const inputStyles =
    "font-body text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] border-line-strong bg-paper-raised focus:outline-none focus:border-forest";

  return (
    <div>
      <PageHero
        title="Organizations"
        subtitle="Find a bank, hospital or government office and book your place in line."
      />

      <div className="max-w-[1140px] mx-auto px-7 pt-12 pb-24">
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or service..."
            className={`${inputStyles} flex-1 min-w-[200px]`}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputStyles}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All categories" : c}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p className="text-ink-soft text-sm">Loading organizations...</p>
        )}
        {error && <p className="text-sm text-[#B8402F]">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-ink-soft text-sm">
            No organizations match your search.
          </p>
        )}

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[18px]">
          {filtered.map((org) => (
            <div
              key={org.id}
              className="bg-paper-raised border border-line rounded-2xl p-[22px] flex flex-col gap-3"
            >
              <div className="flex justify-between items-start gap-2.5">
                <h3 className="font-display font-semibold text-[17px]">
                  {org.name}
                </h3>
                <StatusPill status="verified" />
              </div>
              <div className="font-mono text-[12.5px] text-ink-soft">
                {org.lga}, {org.state} · {org.openTime}–{org.closeTime}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {org.services.map((s) => (
                  <span
                    key={s.id}
                    className="text-[11.5px] px-[9px] py-1 rounded-full bg-paper border border-line text-ink-soft"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center mt-1.5 pt-3.5 border-t border-line">
                <span className="font-mono text-[11px] uppercase tracking-wide text-forest-light font-bold">
                  {org.category}
                </span>
                <a
                  href="/#book"
                  className="text-sm font-semibold text-forest hover:underline"
                >
                  Book →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Organizations;
