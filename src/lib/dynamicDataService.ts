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

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.VITE_BACKEND_URL;

  // 1. Try sending to backend API first if configured
  if (BACKEND_URL) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dynamic-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, data }),
      });

      if (res.ok) {
        return { success: true };
      }
    } catch (backendErr) {
      console.warn("[saveDynamicData] Backend endpoint unreachable, trying client storage:", backendErr);
    }
  }

  // 2. Direct Supabase client fallback
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
      console.warn(`[saveDynamicData] Supabase direct upload error:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error(`[saveDynamicData] Unexpected error uploading ${fileName}:`, err);
    return { success: false, error: err?.message || "Failed to sync to cloud" };
  }
}

/**
 * Upload image file to backend server / Supabase storage and return live URL (no base64)
 */
export async function uploadMediaFile(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.VITE_BACKEND_URL;

  // 1. Upload to backend API if configured
  if (BACKEND_URL) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BACKEND_URL}/api/upload-media`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          return { success: true, url: data.url };
        }
      }
    } catch (backendErr) {
      console.warn("[uploadMediaFile] Backend API upload failed, attempting direct Supabase storage:", backendErr);
    }
  }

  // 2. Direct Supabase storage fallback
  try {
    const ext = file.name.split(".").pop() || "png";
    const cleanFileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("Aayup")
      .upload(cleanFileName, file, {
        contentType: file.type || "image/png",
        upsert: true,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("Aayup")
        .getPublicUrl(cleanFileName);

      if (publicUrlData?.publicUrl) {
        return { success: true, url: publicUrlData.publicUrl };
      }
    } else {
      console.warn("[uploadMediaFile] Supabase direct storage error:", uploadError);
    }
  } catch (supabaseErr: any) {
    console.error("[uploadMediaFile] Supabase fallback error:", supabaseErr);
  }

  return { success: false, error: "Failed to upload image to server." };
}

