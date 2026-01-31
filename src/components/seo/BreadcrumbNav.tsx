import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { BreadcrumbSchema } from '@/components/seo/JsonLdSchema';

export interface BreadcrumbItemProps {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItemProps[];
  className?: string;
}

export function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
  // Prepare schema items
  const schemaItems = items
    .map((item, _idx) => ({
      name: item.label,
      url: item.href || '/',
    }))
    .slice(0, -1); // Remove current page from schema (it's the last item)

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.href && !item.isCurrent ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
