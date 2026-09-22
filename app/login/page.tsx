"use client";

import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
type FormValues = {
  email: string;
  password: string;
};
type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = { email: "", password: "" };

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(name: keyof FormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
    setMessage("");
  }

  function validateForm(formValues: FormValues): FormErrors {
    const nextErrors: FormErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!formValues.password) {
      nextErrors.password = "Please enter your password.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    const firstError = Object.keys(nextErrors)[0] as
      | keyof FormValues
      | undefined;
    if (firstError) {
      document.getElementById(firstError)?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setMessage(result.error ?? "Email or password is incorrect.");
        return;
      }

      router.replace("/dashboard");
    } catch {
      setMessage("We could not connect to the login service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Nikboni home">
          <span className="brand-mark">N</span>
          <span>Nikboni</span>
        </Link>
      </header>

      <main className="auth-main login-main">
        <section className="auth-intro">
          <p className="eyebrow">Welcome back</p>
          <h1>
            Good to <em>see you.</em>
          </h1>
          <p>Sign in to continue your quiet corner of Nikboni.</p>
        </section>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">
            Email address
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-required="true"
            />
            {errors.email && (
              <span className="field-error" id="email-error">
                {errors.email}
              </span>
            )}
          </label>
          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              value={values.password}
              onChange={(event) => handleChange("password", event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-required="true"
            />
            {errors.password && (
              <span className="field-error" id="password-error">
                {errors.password}
              </span>
            )}
          </label>
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
            {!isSubmitting && <span aria-hidden="true">↗</span>}
          </button>
          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}
          <p className="auth-switch">
            New to Nikboni? <Link href="/register">Create an account</Link>
          </p>
        </form>
      </main>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Nikboni</span>
        <span>Quietly made for the curious.</span>
      </footer>
      <ThemeToggle />
    </div>
  );
}
