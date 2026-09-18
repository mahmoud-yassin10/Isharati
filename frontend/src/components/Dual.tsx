type DualProps = {
  ar: string;
  en: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "strong" | "div" | "li" | "figcaption";
  className?: string;
};

/**
 * Both languages live in the DOM. Visibility follows html[lang], which the
 * head bootstrap script sets before first paint — so an English user never
 * sees a frame of Arabic while React catches up.
 */
export function Dual({ ar, en, as = "span", className }: DualProps) {
  const Tag = as;
  return (
    <Tag className={className}>
      <span className="t-ar" lang="ar">
        {ar}
      </span>
      <span className="t-en" lang="en">
        {en}
      </span>
    </Tag>
  );
}
