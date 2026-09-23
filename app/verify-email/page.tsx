import { verifyEmailToken } from "@/lib/customers";
import Link from "next/link";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const result = await verifyEmailToken(token ?? "");
  const isVerified = result === "verified";
  const title = isVerified
    ? "Email verified."
    : result === "expired"
      ? "This link expired."
      : "This link is not valid.";
  const description = isVerified
    ? "Your Nikboni account is ready. You can sign in now."
    : result === "expired"
      ? "Verification links are valid for 24 hours. Please register again to receive a fresh link."
      : "The verification link may have already been used or is incomplete.";

  return (
    <div className="auth-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Nikboni home">
          <span className="brand-mark">N</span>
          <span>Nikboni</span>
        </Link>
      </header>

      <main className="auth-main">
        <section className="auth-intro">
          <p className="eyebrow">Account confirmation</p>
          <h1>
            {isVerified ? (
              <>
                You&apos;re <em>in.</em>
              </>
            ) : (
              <>
                One more <em>step.</em>
              </>
            )}
          </h1>
          <p>{description}</p>
        </section>

        <div className="auth-form">
          <p className="form-message" role="status">
            {title}
          </p>
          <Link
            className="auth-submit"
            href={isVerified ? "/login" : "/register"}
          >
            {isVerified ? "Sign in" : "Create a new account"}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </main>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Nikboni</span>
        <span>Quietly made for the curious.</span>
      </footer>
    </div>
  );
}
