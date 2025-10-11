import { notFound } from "next/navigation";

import { PageBuilder } from "@/components/pagebuilder";
import { client } from "@/lib/sanity/client";
import { sanityFetch } from "@/lib/sanity/live";
import { querySlugPageData, querySlugPagePaths } from "@/lib/sanity/query";
import { getSEOMetadata } from "@/lib/seo";

async function fetchSlugPageData(slug: string, stega = true) {
  return await sanityFetch({
    query: querySlugPageData,
    params: { slug: `/${slug}` },
    stega,
  });
}

async function fetchSlugPagePaths() {
  const slugs = await client.fetch(querySlugPagePaths);
  const paths: { slug: string[] }[] = [];
  for (const slug of slugs) {
    if (!slug) {
      continue;
    }
    const parts = slug.split("/").filter(Boolean);
    paths.push({ slug: parts });
  }
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugString = slug.join("/");
  const { data: pageData } = await fetchSlugPageData(slugString, false);
  return getSEOMetadata(
    pageData
      ? {
          title: pageData?.title ?? pageData?.seoTitle ?? "",
          description: pageData?.description ?? pageData?.seoDescription ?? "",
          slug: pageData?.slug,
          contentId: pageData?._id,
          contentType: pageData?._type,
        }
      : {}
  );
}

export async function generateStaticParams() {
  return await fetchSlugPagePaths();
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugString = slug.join("/");
  const { data: pageData } = await fetchSlugPageData(slugString);

  if (!pageData) {
    return notFound();
  }

  const { title, pageBuilder, _id, _type } = pageData ?? {};

  return !Array.isArray(pageBuilder) || pageBuilder?.length === 0 ? (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 font-semibold text-2xl capitalize">{title}</h1>
      <p className="mb-6 text-muted-foreground">
        This page has no content blocks yet.
      </p>
    </div>
  ) : (
    <PageBuilder id={_id} pageBuilder={pageBuilder} type={_type} />
  );
}
