import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Button from "../components/Button";

const states = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const categories = [
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

const plans = [
  { name: "Starter", price: "₦10,000/mo" },
  { name: "Professional", price: "₦25,000/mo" },
  { name: "Enterprise", price: "₦50,000+/mo" },
];

const inputStyles =
  "font-body text-[14.5px] px-3 py-2.5 rounded-lg border-[1.5px] border-line-strong bg-paper text-ink focus:outline-none focus:border-forest";

// A label wrapping any input, so every field looks the same
function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
      {label}
      {children}
    </label>
  );
}

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Which tab is open. /register?type=business opens the business tab first.
  const [mode, setMode] = useState(
    searchParams.get("type") === "business" ? "business" : "customer",
  );
  const [error, setError] = useState("");
  const [businessSubmitted, setBusinessSubmitted] = useState(false);

  // ---- Customer form ----
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!customer.name || !customer.email || !customer.password) {
      setError("Name, email and password are required.");
      return;
    }
    // TODO: POST to the backend's register endpoint (role: customer)
    console.log("Registering customer", customer);
    navigate("/login");
  };

  // ---- Business form ----
  const [business, setBusiness] = useState({
    businessName: "",
    category: "",
    address: "",
    state: "",
    lga: "",
    openTime: "",
    closeTime: "",
    contactEmail: "",
    contactPhone: "",
    // Preselected from /register?type=business&plan=Starter
    plan: plans.some((p) => p.name === searchParams.get("plan"))
      ? searchParams.get("plan")
      : "Professional",
    password: "",
  });
  // Services are a list, so they live in their own state as an array
  const [services, setServices] = useState([]);
  const [serviceInput, setServiceInput] = useState("");

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusiness((prev) => ({ ...prev, [name]: value }));
  };

  const addService = () => {
    const value = serviceInput.trim();
    if (!value || services.includes(value)) return;
    setServices((prev) => [...prev, value]);
    setServiceInput("");
  };

  const removeService = (service) =>
    setServices((prev) => prev.filter((s) => s !== service));

  const handleBusinessSubmit = (e) => {
    e.preventDefault();
    setError("");

    const required = [
      "businessName",
      "category",
      "address",
      "state",
      "lga",
      "openTime",
      "closeTime",
      "contactEmail",
      "password",
    ];
    if (required.some((key) => !business[key]) || services.length === 0) {
      setError("Please fill in every field and add at least one service.");
      return;
    }

    // TODO: POST to the backend's organization register endpoint
    console.log("Registering business", { ...business, services });
    setBusinessSubmitted(true);
  };

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const tabStyles = (tab) =>
    `flex-1 text-center py-2.5 rounded-[7px] text-[13.5px] font-semibold transition ${
      mode === tab ? "bg-forest text-white" : "text-ink-soft hover:text-forest"
    }`;

  return (
    <div className="min-h-screen flex justify-center px-4 py-16">
      <div className="w-full max-w-[480px] bg-paper-raised border border-line rounded-2xl shadow-lg px-8 py-9 h-fit">
        <div className="flex bg-paper border border-line rounded-[10px] p-1 mb-7">
          <button
            type="button"
            onClick={() => switchMode("customer")}
            className={tabStyles("customer")}
          >
            I'm a customer
          </button>
          <button
            type="button"
            onClick={() => switchMode("business")}
            className={tabStyles("business")}
          >
            I run a business
          </button>
        </div>

        {error && (
          <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5 mb-4">
            {error}
          </p>
        )}

        {mode === "customer" && (
          <>
            <h1 className="font-display font-semibold text-2xl mb-1">
              Create your account
            </h1>
            <p className="text-ink-soft text-sm mb-6">
              Book appointments and skip the physical line.
            </p>

            <form
              onSubmit={handleCustomerSubmit}
              className="flex flex-col gap-4"
            >
              <Field label="Full name">
                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={handleCustomerChange}
                  placeholder="e.g. Chidinma Okafor"
                  className={inputStyles}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleCustomerChange}
                  className={inputStyles}
                />
              </Field>
              <Field label="Phone number">
                <input
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={handleCustomerChange}
                  placeholder="080X XXX XXXX"
                  className={inputStyles}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  name="password"
                  value={customer.password}
                  onChange={handleCustomerChange}
                  className={inputStyles}
                />
              </Field>
              <Button text="Create account" type="submit" fullWidth />
            </form>
          </>
        )}

        {mode === "business" && !businessSubmitted && (
          <>
            <h1 className="font-display font-semibold text-2xl mb-1">
              Register your business
            </h1>
            <p className="text-ink-soft text-sm mb-6">
              Give your customers a way to book ahead and skip the line.
            </p>

            <form
              onSubmit={handleBusinessSubmit}
              className="flex flex-col gap-4"
            >
              <Field label="Business name">
                <input
                  type="text"
                  name="businessName"
                  value={business.businessName}
                  onChange={handleBusinessChange}
                  placeholder="e.g. First City Bank — Wuse II"
                  className={inputStyles}
                />
              </Field>

              <Field label="Category">
                <select
                  name="category"
                  value={business.category}
                  onChange={handleBusinessChange}
                  className={inputStyles}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Address">
                <input
                  type="text"
                  name="address"
                  value={business.address}
                  onChange={handleBusinessChange}
                  placeholder="Street address"
                  className={inputStyles}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3.5">
                <Field label="State">
                  <select
                    name="state"
                    value={business.state}
                    onChange={handleBusinessChange}
                    className={inputStyles}
                  >
                    <option value="" disabled>
                      Select state
                    </option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="LGA">
                  <input
                    type="text"
                    name="lga"
                    value={business.lga}
                    onChange={handleBusinessChange}
                    placeholder="Local government area"
                    className={inputStyles}
                  />
                </Field>
              </div>

              <Field label="Services offered">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      // Enter adds the service instead of submitting the whole form
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addService();
                      }
                    }}
                    placeholder="e.g. Account Opening"
                    className={`${inputStyles} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={addService}
                    className="px-4 rounded-lg border-[1.5px] border-line-strong text-sm font-semibold hover:border-forest hover:text-forest"
                  >
                    Add
                  </button>
                </div>
                {services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {services.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-tint text-amber-deep font-semibold"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeService(s)}
                          aria-label={`Remove ${s}`}
                          className="hover:text-ink"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-3.5">
                <Field label="Opens at">
                  <input
                    type="time"
                    name="openTime"
                    value={business.openTime}
                    onChange={handleBusinessChange}
                    className={inputStyles}
                  />
                </Field>
                <Field label="Closes at">
                  <input
                    type="time"
                    name="closeTime"
                    value={business.closeTime}
                    onChange={handleBusinessChange}
                    className={inputStyles}
                  />
                </Field>
              </div>

              <Field label="Contact email">
                <input
                  type="email"
                  name="contactEmail"
                  value={business.contactEmail}
                  onChange={handleBusinessChange}
                  className={inputStyles}
                />
              </Field>
              <Field label="Contact phone">
                <input
                  type="tel"
                  name="contactPhone"
                  value={business.contactPhone}
                  onChange={handleBusinessChange}
                  placeholder="080X XXX XXXX"
                  className={inputStyles}
                />
              </Field>
              <Field label="Plan">
                <select
                  name="plan"
                  value={business.plan}
                  onChange={handleBusinessChange}
                  className={inputStyles}
                >
                  {plans.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} — {p.price}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  name="password"
                  value={business.password}
                  onChange={handleBusinessChange}
                  className={inputStyles}
                />
              </Field>

              <Button text="Register business" type="submit" fullWidth />
            </form>
          </>
        )}

        {mode === "business" && businessSubmitted && (
          <div className="text-center py-4">
            <h1 className="font-display font-semibold text-2xl mb-2">
              Application received
            </h1>
            <p className="text-ink-soft text-sm mb-6">
              Thanks, {business.businessName}. We'll verify your details and
              email {business.contactEmail} once your organization is approved.
            </p>
            <Link
              to="/login"
              className="text-forest font-semibold text-sm hover:underline"
            >
              Go to log in →
            </Link>
          </div>
        )}

        <p className="text-center text-[13.5px] text-ink-soft mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-forest font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
