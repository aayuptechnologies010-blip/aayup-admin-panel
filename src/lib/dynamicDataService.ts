import { supabase } from "@/integrations/supabase/client";

export const DYNAMIC_KEYS = {
  TEAM: "aayup_dynamic_team_members",
  BLOGS: "aayup_dynamic_blog_posts",
  PROJECTS: "aayup_dynamic_portfolio_projects",
  FAQS: "aayup_dynamic_faqs",
  ANNOUNCEMENT: "aayup_dynamic_announcement",
} as const;

const FILE_MAP: Record<string, string> = {
  [DYNAMIC_KEYS.TEAM]: "team_members.json",
  [DYNAMIC_KEYS.BLOGS]: "blog_posts.json",
  [DYNAMIC_KEYS.PROJECTS]: "portfolio_projects.json",
  [DYNAMIC_KEYS.FAQS]: "faqs.json",
  [DYNAMIC_KEYS.ANNOUNCEMENT]: "announcements.json",
};

/**
 * Fetch dynamic data from Supabase Cloud Storage with local fallback
 */
export async function getDynamicData<T>(key: string, fallbackData: T): Promise<T> {
  const fileName = FILE_MAP[key];
  
  // 1. First attempt to load fresh cloud data from Supabase public storage
  if (fileName) {
    try {
      const { data: publicUrlData } = supabase.storage
        .from("Aayup")
        .getPublicUrl(`site-data/${fileName}`);

      if (publicUrlData?.publicUrl) {
        // Cache-busting timestamp ensures users immediately see panel updates
        const res = await fetch(`${publicUrlData.publicUrl}?t=${Date.now()}`, {
          cache: "no-store",
        });

        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData !== null && cloudData !== undefined) {
            // Sync local storage mirror for offline / fast fallback
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(key, JSON.stringify(cloudData));
              } catch (e) {
                // ignore quota issues
              }
            }
            return cloudData as T;
          }
        }
      }
    } catch (err) {
      console.warn(`[getDynamicData] Cloud fetch failed for ${key}, falling back:`, err);
    }
  }

  // 2. Second fallback to localStorage mirror
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(key);
      if (local) {
        return JSON.parse(local) as T;
      }
    } catch (e) {
      // ignore JSON parse errors
    }
  }

  // 3. Fallback to default bundled data
  return fallbackData;
}

/**
 * Save dynamic data to Supabase Cloud Storage and update local mirror
 */
export async function saveDynamicData<T>(key: string, data: T): Promise<{ success: boolean; error?: string }> {
  // Update local storage first for instant feedback in UI
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event("aayup_dynamic_data_updated"));
    } catch (e) {
      console.warn("localStorage quota exceeded or unavailable", e);
    }
  }

  const fileName = FILE_MAP[key];
  if (!fileName) {
    return { success: true };
  }

  try {
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const { error } = await supabase.storage
      .from("Aayup")
      .upload(`site-data/${fileName}`, jsonBlob, {
        contentType: "application/json",
        upsert: true,
      });

    if (error) {
      console.error(`[saveDynamicData] Failed to save ${fileName} to Supabase:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error(`[saveDynamicData] Unexpected error uploading ${fileName}:`, err);
    return { success: false, error: err?.message || "Failed to sync to cloud" };
  }
}
