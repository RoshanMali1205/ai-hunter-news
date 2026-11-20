import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { ArticleView } from "./components/ArticleView";
import { HomePage } from "./components/HomePage";
import { LearnPage } from "./components/LearnPage";
import { ReposPage } from "./components/ReposPage";
import { SavedPage } from "./components/SavedPage";
import { Shell } from "./components/Shell";
import { StateMessage } from "./components/StateMessage";
import { TopicEditionPage } from "./components/TopicEditionPage";
import { TopicsPage } from "./components/TopicsPage";
import { FALLBACK_STORIES } from "./data/fallback";
import { addReadId, readReadIds, takeLastVisit } from "./lib/activity";
import { fetchEdition, type SourceCoverage } from "./lib/fetchEdition";
import {
  readEdition,
  readSavedStories,
  toggleSavedStory,
  writeEdition,
  writeSavedStories,
} from "./lib/storage";
import type { Story } from "./types";

function StoryRoute({
  stories,
  savedStories,
  loading,
  onToggleSaved,
  onRead,
}: {
  stories: Story[];
  savedStories: Story[];
  loading: boolean;
  onToggleSaved: (story: Story) => void;
  onRead: (id: string) => void;
}) {
  const { id } = useParams();
  const story = [...stories, ...savedStories].find((item) => item.id === id);
  const storyId = story?.id;
  useEffect(() => {
    if (storyId) onRead(storyId);
  }, [storyId, onRead]);
  if (!story && loading && stories.length === 0 && savedStories.length === 0) {
    return (
      <main className="page-content">
        <div className="story-skeletons" aria-label="Loading story" aria-busy="true">
          <span className="skeleton skeleton-lead" />
          <span className="skeleton skeleton-row" />
        </div>
      </main>
    );
  }
  return (
    <ArticleView
      key={id}
      story={story}
      allStories={stories}
      savedStories={savedStories}
      onToggleSaved={onToggleSaved}
    />
  );
}

function ReaderApp() {
  const [initialEdition] = useState(() => readEdition());
  const [stories, setStories] = useState<Story[]>(initialEdition?.stories ?? []);
  const [updatedAt, setUpdatedAt] = useState(initialEdition?.updatedAt);
  const [coverage, setCoverage] = useState<SourceCoverage>();
  const hasLiveEditionRef = useRef(Boolean(initialEdition));
  const [savedStories, setSavedStories] = useState(() => readSavedStories());
  const [refreshError, setRefreshError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [refreshing, setRefreshing] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [readIds, setReadIds] = useState(() => readReadIds());
  const [lastVisit] = useState(() => takeLastVisit());
  const onRead = useCallback((id: string) => setReadIds((current) => addReadId(current, id)), []);

  useEffect(() => {
    let active = true;
    setRefreshing(true);

    void fetchEdition()
      .then((edition) => {
        if (!active) return;
        const cached = { updatedAt: edition.updatedAt, stories: edition.stories };
        if (!writeEdition(cached)) {
          setStorageError("This edition couldn't be saved on this device.");
        } else {
          setStorageError("");
        }
        setStories(edition.stories);
        setUpdatedAt(edition.updatedAt);
        setCoverage({
          successfulSources: edition.successfulSources,
          failedSourceIds: edition.failedSourceIds,
        });
        hasLiveEditionRef.current = true;
        setRefreshError("");
      })
      .catch(() => {
        if (!active) return;
        if (!hasLiveEditionRef.current) {
          setStories(FALLBACK_STORIES);
          setUpdatedAt(undefined);
        }
        setRefreshError(
          hasLiveEditionRef.current
            ? "Couldn't refresh. Showing the last edition."
            : "Couldn't reach the sources. Showing a saved edition.",
        );
      })
      .finally(() => {
        if (active) setRefreshing(false);
      });

    return () => {
      active = false;
    };
  }, [refreshCount]);

  // Fetch fresh news when the installed app is reopened or the phone comes back online.
  const updatedAtRef = useRef(updatedAt);
  updatedAtRef.current = updatedAt;
  useEffect(() => {
    const STALE_MS = 5 * 60_000;
    const refreshIfStale = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      const last = updatedAtRef.current ? Date.parse(updatedAtRef.current) : 0;
      if (Date.now() - last > STALE_MS) setRefreshCount((count) => count + 1);
    };
    document.addEventListener("visibilitychange", refreshIfStale);
    window.addEventListener("online", refreshIfStale);
    return () => {
      document.removeEventListener("visibilitychange", refreshIfStale);
      window.removeEventListener("online", refreshIfStale);
    };
  }, []);

  const onToggleSaved = (story: Story) => {
    const next = toggleSavedStory(savedStories, story);
    setSavedStories(next);
    setStorageError(
      writeSavedStories(next)
        ? ""
        : "Your reading list couldn't be saved on this device.",
    );
  };
  const onRefresh = () => {
    setRefreshing(true);
    setRefreshCount((count) => count + 1);
  };

  return (
    <Routes>
      <Route
        element={
          <Shell
            savedCount={savedStories.length}
            error={refreshError}
            storageError={storageError}
            onRetry={onRefresh}
          />
        }
      >
        <Route
          path="/"
          element={
            <HomePage
              stories={stories}
              savedStories={savedStories}
              loading={refreshing}
              updatedAt={updatedAt}
              onToggleSaved={onToggleSaved}
              onRefresh={onRefresh}
              refreshing={refreshing}
              readIds={readIds}
              lastVisit={lastVisit}
              coverage={coverage}
            />
          }
        />
        <Route
          path="/topics"
          element={
            <TopicsPage
              stories={stories}
              savedStories={savedStories}
              loading={refreshing}
              onToggleSaved={onToggleSaved}
            />
          }
        />
        <Route
          path="/topics/:topicId"
          element={
            <TopicEditionPage
              stories={stories}
              savedStories={savedStories}
              loading={refreshing}
              onToggleSaved={onToggleSaved}
            />
          }
        />
        <Route path="/repos" element={<ReposPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route
          path="/saved"
          element={<SavedPage savedStories={savedStories} onToggleSaved={onToggleSaved} />}
        />
        <Route
          path="/story/:id"
          element={
            <StoryRoute
              stories={stories}
              savedStories={savedStories}
              loading={refreshing}
              onToggleSaved={onToggleSaved}
              onRead={onRead}
            />
          }
        />
        <Route
          path="*"
          element={
            <main className="page-content">
              <StateMessage
                title="Page not found"
                message="There’s nothing at this address."
                action={{ label: "Back to Home", to: "/" }}
              />
            </main>
          }
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ReaderApp />
    </BrowserRouter>
  );
}
