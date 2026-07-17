import type { Metadata } from "next";
import { StoryNotFound } from "@/features/story/StoryNotFound";
import { aesopExcerpt } from "@/services/aesop-stories.service";
import { resolveStoryPage } from "@/lib/resolve-story-page";
import { excerptFromContent } from "@/utils/excerpt";
import { StoryPageClient } from "./StoryPageClient";

type StoryPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const resolved = await resolveStoryPage(id);

  if (resolved.kind === "not-found") {
    return { title: "Story not found — Stories" };
  }

  if (resolved.kind === "aesop") {
    return {
      title: `${resolved.aesopStory.title} — Stories`,
      description: aesopExcerpt(resolved.aesopStory.story),
    };
  }

  const description =
    resolved.story.excerpt?.trim() ||
    excerptFromContent(resolved.story.content ?? "");

  return {
    title: `${resolved.story.title} — Stories`,
    description,
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const resolved = await resolveStoryPage(id);

  if (resolved.kind === "not-found") {
    return <StoryNotFound />;
  }

  if (resolved.kind === "aesop") {
    return (
      <StoryPageClient
        kind="aesop"
        aesopStory={resolved.aesopStory}
        relatedAesop={resolved.relatedAesop}
      />
    );
  }

  return (
    <StoryPageClient
      kind="spring"
      id={id}
      initialStory={resolved.story}
      initialRelated={resolved.related}
    />
  );
}
