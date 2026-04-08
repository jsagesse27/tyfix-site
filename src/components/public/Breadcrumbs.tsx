import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbSchema } from '@/components/seo/JsonLd';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation with BreadcrumbList JSON-LD schema.
 * Server-rendered. The last item is the current page (not clickable).
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ label: 'Home', href: '/' }, ...items];
  const schemaItems = allItems.map((item) => ({
    name: item.label,
    url: item.href,
  }));

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {index === 0 && <Home size={14} className="text-gray-400" />}
                {index > 0 && <ChevronRight size={14} className="text-gray-300" />}
                {isLast ? (
                  <span className="font-medium text-gray-700" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-primary transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
