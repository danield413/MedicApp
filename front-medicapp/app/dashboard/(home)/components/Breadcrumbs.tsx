'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs as HeroBreadcrumbs, BreadcrumbItem } from '@heroui/react';
import { ROUTE_NAME_MAP } from '@/lib';

export const Breadcrumbs = () => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // No mostrar breadcrumbs en la raíz del dashboard
  if (segments.length <= 1) {
    return null;
  }

  return (
    <HeroBreadcrumbs>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const name = ROUTE_NAME_MAP[ segment ] || segment;
        const isLast = index === segments.length - 1;

        return (
          <BreadcrumbItem key={href} isCurrent={isLast}>
            {isLast ? (
              <span className="capitalize">{name}</span>
            ) : (
              <Link href={href} className="capitalize">
                {name}
              </Link>
            )}
          </BreadcrumbItem>
        );
      })}
    </HeroBreadcrumbs>
  );
};
