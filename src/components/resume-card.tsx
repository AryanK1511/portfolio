'use client';

import { ChevronRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardHeader } from '@/components/ui/card';

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  period: string;
  bulletPoints?: readonly string[];
}
export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  period,
  bulletPoints,
}: ResumeCardProps) => {
  return (
    <Link href={href || '#'} className="block cursor-pointer">
      <Card className="flex">
        <div className="flex-none">
          <Image
            src={logoUrl}
            alt={altText}
            width={62}
            height={62}
            className="rounded-full object-contain bg-muted-background dark:bg-foreground"
          />
        </div>
        <div className="flex-grow ml-4 items-center flex-col group">
          <CardHeader>
            <div className="flex items-center justify-between gap-x-2 text-base">
              <h3 className="inline-flex items-center justify-center font-semibold leading-none text-xs sm:text-sm">
                {title}

                <ChevronRightIcon className="size-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100" />
              </h3>
              <div className="text-xs sm:text-sm tabular-nums text-muted-foreground text-right">
                {period}
              </div>
            </div>
            {subtitle && <div className="font-sans text-xs">{subtitle}</div>}
          </CardHeader>
          {bulletPoints && bulletPoints.length > 0 && (
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
              <ul className="space-y-1">
                {bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-foreground">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
