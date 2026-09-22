import { auth } from "@/auth";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import { redirect } from "next/navigation";
import { promises as fs } from "node:fs";
import path from "node:path";
import LogoutButton from "../dashboard/LogoutButton";

type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role?: "customer" | "administrator";
  loginCount?: number;
  lastLoginAt?: string;
};

async function getCustomers() {
  const customersFile = path.join(
    process.cwd(),
    ".data",
    "registration",
    "customers.json",
  );
  const file = await fs.readFile(customersFile, "utf8");
  return JSON.parse(file) as CustomerRecord[];
}

function formatDate(value: string | undefined) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "administrator") redirect("/dashboard");

  let customers: CustomerRecord[] = [];
  try {
    customers = await getCustomers();
  } catch {
    customers = [];
  }

  const totalLogins = customers.reduce(
    (total, customer) => total + (customer.loginCount ?? 0),
    0,
  );
  const latestLogin = customers
    .filter((customer) => customer.lastLoginAt)
    .sort(
      (first, second) =>
        new Date(second.lastLoginAt ?? 0).getTime() -
        new Date(first.lastLoginAt ?? 0).getTime(),
    )[0]?.lastLoginAt;

  return (
    <div className="dashboard-shell admin-shell">
      <header className="dashboard-header">
        <Link className="brand" href="/" aria-label="Nikboni home">
          <span className="brand-mark">N</span>
          <span>Nikboni</span>
        </Link>
        <div className="admin-header-actions">
          <span className="admin-badge">Administrator</span>
          <LogoutButton />
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <p className="eyebrow">Administration</p>
          <h1>
            Know what is <em>happening.</em>
          </h1>
          <p>Registration and login activity at a glance.</p>
        </section>

        <section className="admin-stats" aria-label="Authentication statistics">
          <article className="admin-stat">
            <span className="number">01</span>
            <strong>{customers.length}</strong>
            <p>Registered customers</p>
          </article>
          <article className="admin-stat">
            <span className="number">02</span>
            <strong>{totalLogins}</strong>
            <p>Total successful logins</p>
          </article>
          <article className="admin-stat">
            <span className="number">03</span>
            <strong>{formatDate(latestLogin)}</strong>
            <p>Latest login</p>
          </article>
        </section>

        <section
          className="customer-list"
          aria-labelledby="customer-list-heading"
        >
          <div className="dashboard-card-heading">
            <div>
              <p className="eyebrow">People</p>
              <h2 id="customer-list-heading">Registered customers</h2>
            </div>
            <span className="account-status">Live data</span>
          </div>
          <div className="customer-table-wrap">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Logins</th>
                  <th>Last login</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>{customer.loginCount ?? 0}</td>
                    <td>{formatDate(customer.lastLoginAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Nikboni</span>
        <span>Private administration area.</span>
      </footer>
      <ThemeToggle />
    </div>
  );
}
