function cspConnectSrc(): string {
  const parts = ["'self'"];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  const region = process.env.NEXT_PUBLIC_COGNITO_REGION?.trim();
  if (apiUrl) parts.push(apiUrl);
  if (region) {
    parts.push(`https://cognito-idp.${region}.amazonaws.com`);
    parts.push(`https://cognito-identity.${region}.amazonaws.com`);
  }
  return parts.join(" ");
}

export function getSecurityHeaders(): { key: string; value: string }[] {
  const isDev = process.env.NODE_ENV === "development";
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${cspConnectSrc()}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

  return [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    { key: "Content-Security-Policy", value: csp },
  ];
}
