
import Link from "next/link";

const adminLinks = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Recipes",
    href: "/admin/recipes",
  },
  {
    label: "Categories",
    href: "/admin/categories",
  },
  {
    label: "Ingredients",
    href: "/admin/ingredients",
  },
];

export default function AdminSidebar() {
  return (
    <aside>
      <h2>ChopLingo Admin</h2>

      <nav aria-label="Admin navigation">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
