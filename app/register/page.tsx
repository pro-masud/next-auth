"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Theme = "light" | "dark";
type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";

    const savedTheme = window.localStorage.getItem("nikboni-theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("nikboni-theme", nextTheme);
  }

  function handleChange(name: keyof FormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
    setMessage("");
  }

  function validateForm(formValues: FormValues): FormErrors {
    const nextErrors: FormErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formValues.name.trim().length < 2) {
      nextErrors.name = "Please enter your full name.";
    }
    if (!emailPattern.test(formValues.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (formValues.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    } else if (
      !/[A-Z]/.test(formValues.password) ||
      !/[0-9]/.test(formValues.password)
    ) {
      nextErrors.password = "Add at least one uppercase letter and one number.";
    }
    if (formValues.confirmPassword !== formValues.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
      document
        .getElementById(
          firstError === "confirmPassword" ? "confirm-password" : firstError,
        )
        ?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({
            email: result.error ?? "This email is already registered.",
          });
        } else {
          setMessage(
            result.error ?? "We could not create your account right now.",
          );
        }
        return;
      }

      setMessage(result.message ?? "Your account has been created.");
      setValues(initialValues);
    } catch {
      setMessage("We could not connect to the registration service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordHint = !values.password
    ? "Use 8+ characters, one uppercase letter, and one number."
    : values.password.length >= 8 &&
        /[A-Z]/.test(values.password) &&
        /[0-9]/.test(values.password)
      ? "Strong password"
      : "Keep going: 8+ characters, one uppercase letter, and one number.";

  return (
    <div className="auth-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Nikboni home">
          <span className="brand-mark">N</span>
          <span>Nikboni</span>
        </Link>

        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <span aria-hidden="true">{theme === "light" ? "◐" : "○"}</span>
          <span className="toggle-label">
            {theme === "light" ? "Dark" : "Light"}
          </span>
        </button>
      </header>

      <main className="auth-main">
        <section className="auth-intro">
          <p className="eyebrow">Begin here</p>
          <h1>
            Create your <em>space.</em>
          </h1>
          <p>
            Join Nikboni with a simple account. You can always change your
            details later.
          </p>
        </section>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="name">
            Full name
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-required="true"
            />
            {errors.name && (
              <span className="field-error" id="name-error">
                {errors.name}
              </span>
            )}
          </label>
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
              placeholder="At least 8 characters"
              value={values.password}
              onChange={(event) => handleChange("password", event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby="password-hint password-error"
              aria-required="true"
            />
            <span
              className={`password-hint ${values.password && !errors.password ? "is-valid" : ""}`}
              id="password-hint"
            >
              {passwordHint}
            </span>
            {errors.password && (
              <span className="field-error" id="password-error">
                {errors.password}
              </span>
            )}
          </label>
          <label htmlFor="confirm-password">
            Confirm password
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="Repeat your password"
              value={values.confirmPassword}
              onChange={(event) =>
                handleChange("confirmPassword", event.target.value)
              }
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
              aria-required="true"
            />
            {errors.confirmPassword && (
              <span className="field-error" id="confirm-password-error">
                {errors.confirmPassword}
              </span>
            )}
          </label>
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
            {!isSubmitting && <span aria-hidden="true">↗</span>}
          </button>
          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}
          <p className="auth-switch">
            Already have an account? <Link href="/">Sign in</Link>
          </p>
        </form>
      </main>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Nikboni</span>
        <span>Quietly made for the curious.</span>
      </footer>
    </div>
  );
}
