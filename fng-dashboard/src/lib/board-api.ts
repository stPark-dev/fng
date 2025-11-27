import { createSupabaseBrowserClient } from "./supabase";

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  category: "fear" | "greed";
  view_count: number;
  created_at: string;
  updated_at: string;
  // Join된 사용자 정보
  user?: {
    email: string;
    user_metadata: {
      name?: string;
      avatar_url?: string;
      picture?: string;
    };
  };
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Join된 사용자 정보
  user?: {
    email: string;
    user_metadata: {
      name?: string;
      avatar_url?: string;
      picture?: string;
    };
  };
}

export interface CreatePostInput {
  title: string;
  content: string;
  image_url?: string;
  category: "fear" | "greed";
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  image_url?: string;
  category?: "fear" | "greed";
}

// 이미지를 WebP로 변환
export async function convertToWebP(file: File, maxWidth: number = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert image to WebP"));
            }
          },
          "image/webp",
          0.8
        );
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

// 이미지 업로드
export async function uploadPostImage(file: File, userId: string): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const webpBlob = await convertToWebP(file);
  const fileName = `${userId}/${Date.now()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(fileName, webpBlob, {
      contentType: "image/webp",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("post-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// 게시글 목록 조회
export async function getPosts(
  category?: "fear" | "greed",
  page: number = 1,
  limit: number = 10
): Promise<{ posts: Post[]; total: number }> {
  const supabase = createSupabaseBrowserClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`게시글 조회 실패: ${error.message}`);
  }

  return {
    posts: data || [],
    total: count || 0,
  };
}

// 게시글 상세 조회
export async function getPost(id: string): Promise<Post | null> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`게시글 조회 실패: ${error.message}`);
  }

  return data;
}

// 조회수 증가
export async function incrementViewCount(postId: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.rpc("increment_view_count", {
    post_id: postId,
  });

  if (error) {
    console.error("조회수 증가 실패:", error);
  }
}

// 게시글 생성
export async function createPost(input: CreatePostInput): Promise<Post> {
  const supabase = createSupabaseBrowserClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...input,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`게시글 작성 실패: ${error.message}`);
  }

  return data;
}

// 게시글 수정
export async function updatePost(id: string, input: UpdatePostInput): Promise<Post> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("posts")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`게시글 수정 실패: ${error.message}`);
  }

  return data;
}

// 게시글 삭제
export async function deletePost(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`게시글 삭제 실패: ${error.message}`);
  }
}

// 댓글 목록 조회
export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`댓글 조회 실패: ${error.message}`);
  }

  return data || [];
}

// 댓글 작성
export async function createComment(postId: string, content: string): Promise<Comment> {
  const supabase = createSupabaseBrowserClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`댓글 작성 실패: ${error.message}`);
  }

  return data;
}

// 댓글 수정
export async function updateComment(id: string, content: string): Promise<Comment> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("comments")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`댓글 수정 실패: ${error.message}`);
  }

  return data;
}

// 댓글 삭제
export async function deleteComment(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`댓글 삭제 실패: ${error.message}`);
  }
}
