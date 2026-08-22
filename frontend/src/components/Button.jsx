const VARIANTS = {
  primary:
    "bg-teal text-white hover:bg-teal-dark disabled:bg-teal/50 shadow-sm",
  secondary:
    "bg-white text-navy border border-line hover:border-navy/40 disabled:opacity-50",
  danger:
    "bg-white text-coral border border-coral/30 hover:bg-coral-light disabled:opacity-50",
  ghost:
    "bg-transparent text-navy hover:bg-navy/5 disabled:opacity-50",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
