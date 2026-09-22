import ThemeToggle from "@/components/ThemeToggle";
import { getSessionCustomerId } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { promises as fs } from "node:fs";
import path from "node:path";
import LogoutButton from "./LogoutButton";

type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

async function getCustomer(customerId: string) {
  const customersFile = path.join(
    process.cwd(),
    ".data",
    "registration",
    "customers.json",
  );
  const file = await fs.readFile(customersFile, "utf8");
  const customers = JSON.parse(file) as CustomerRecord[];
  return customers.find((customer) => customer.id === customerId) ?? null;
}

export default async function DashboardPage() {
  const customerId = await getSessionCustomerId();
  if (!customerId) redirect("/login");

  let customer: CustomerRecord | null = null;
  try {
    customer = await getCustomer(customerId);
  } catch {
    redirect("/login");
  }

  if (!customer) redirect("/login");

  const joinedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(new Date(customer.createdAt));

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="brand" href="/" aria-label="Nikboni home">
          <span className="brand-mark">N</span>
          <span>Nikboni</span>
        </Link>
        <LogoutButton />
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <p className="eyebrow">Your private space</p>
          <h1>
            Welcome, <em>{customer.name.split(" ")[0]}.</em>
          </h1>
          <p>Everything here is just for you.</p>
        </section>

        <section className="dashboard-card" aria-labelledby="account-heading">
          <div className="dashboard-card-heading">
            <div>
              <p className="eyebrow">Account details</p>
              <h2 id="account-heading">Your information</h2>
            </div>
            <span className="account-status">Active</span>
          </div>
          <dl className="account-details">
            <div>
              <dt>Full name</dt>
              <dd>{customer.name}</dd>
            </div>
            <div>
              <dt>Email address</dt>
              <dd>{customer.email}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{joinedDate}</dd>
            </div>
            <div>
              <dt>Account ID</dt>
              <dd>{customer.id}</dd>
            </div>
          </dl>
        </section>
      </main>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Nikboni</span>
        <span>Your information stays yours.</span>
      </footer>
      <ThemeToggle />
    </div>
  );
}
