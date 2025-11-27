"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import {
  getPost,
  deletePost,
  incrementViewCount,
  getComments,
  createComment,
  deleteComment,
  Post,
  Comment,
} from "@/lib/board-api";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import LanguageSwitch from "@/components/LanguageSwitch";
import AuthButton from "@/components/AuthButton";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locale, fontClass } = useI18n();
  const { user } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<{ name: string; avatar_url: string | null } | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, { name: string; avatar_url: string | null }>>({});
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const viewCountIncremented = useRef(false);

  useEffect(() => {
    loadPost();

    // 조회수는 한 번만 증가 (React Strict Mode 대응)
    if (!viewCountIncremented.current) {
      viewCountIncremented.current = true;
      incrementViewCount(postId);
    }
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const postData = await getPost(postId);
      if (!postData) {
        router.push("/board");
        return;
      }
      setPost(postData);

      // 작성자 정보 가져오기
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.admin.getUserById(postData.user_id).catch(() => ({ data: null }));

      // admin API가 안되면 posts 테이블에서 가져온 user_id로 표시
      if (userData?.user) {
        setAuthor({
          name: userData.user.user_metadata?.name || userData.user.email?.split("@")[0] || "Unknown",
          avatar_url: userData.user.user_metadata?.avatar_url || userData.user.user_metadata?.picture || null,
        });
      }

      // 댓글 로드
      const commentsData = await getComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(locale === "ko" ? "정말 삭제하시겠습니까?" : "Are you sure you want to delete?")) {
      return;
    }

    setDeleting(true);
    try {
      await deletePost(postId);
      router.push("/board");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert(locale === "ko" ? "삭제에 실패했습니다." : "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const comment = await createComment(postId, newComment.trim());
      setComments([...comments, comment]);
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert(locale === "ko" ? "댓글 작성에 실패했습니다." : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(locale === "ko" ? "댓글을 삭제하시겠습니까?" : "Delete this comment?")) {
      return;
    }

    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryStyle = (cat: "fear" | "greed") => {
    return cat === "fear"
      ? "bg-[#ff4444]/20 text-[#ff4444] border-[#ff4444]/50"
      : "bg-[#aa44ff]/20 text-[#aa44ff] border-[#aa44ff]/50";
  };

  const getCategoryLabel = (cat: "fear" | "greed") => {
    return cat === "fear"
      ? locale === "ko" ? "공포" : "Fear"
      : locale === "ko" ? "탐욕" : "Greed";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0a08] flex items-center justify-center">
        <p className={`${fontClass} text-[#907050]`}>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0d0a08] flex items-center justify-center">
        <p className={`${fontClass} text-[#907050]`}>
          {locale === "ko" ? "게시글을 찾을 수 없습니다." : "Post not found."}
        </p>
      </div>
    );
  }

  const isAuthor = user?.id === post.user_id;

  return (
    <div className="min-h-screen bg-[#0d0a08] relative vignette grain">
      {/* 헤더 */}
      <header className="border-b-2 border-[#3d2d1f] bg-gradient-to-b from-[#1a1512] to-[#0d0a08] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/board">
              <h1 className={`${fontClass} text-xl text-[#e0d0b8] hover:text-[#c03030] transition-colors cursor-pointer`}>
                {locale === "ko" ? "공포와 탐욕의 전당" : "Hall of Fear & Greed"}
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSwitch />
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 게시글 */}
        <article className="dark-box p-6 mb-6">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className={`${fontClass} text-xs px-2 py-0.5 border ${getCategoryStyle(post.category)}`}>
                {getCategoryLabel(post.category)}
              </span>
              <h1 className={`${fontClass} text-2xl text-[#e0d0b8] mt-2`}>{post.title}</h1>
            </div>

            {isAuthor && (
              <div className="flex gap-2">
                <Link href={`/board/${postId}/edit`}>
                  <button className="dark-btn text-xs px-3 py-1">
                    {locale === "ko" ? "수정" : "Edit"}
                  </button>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs px-3 py-1 border-2 border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-white transition-colors disabled:opacity-50"
                >
                  {deleting ? "..." : locale === "ko" ? "삭제" : "Delete"}
                </button>
              </div>
            )}
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#3d2d1f]">
            <div className="flex items-center gap-2">
              {author?.avatar_url ? (
                <Image
                  src={author.avatar_url}
                  alt={author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#8b0000] flex items-center justify-center text-white text-xs">
                  ?
                </div>
              )}
              <span className={`${fontClass} text-sm text-[#a08060]`}>
                {author?.name || "Unknown"}
              </span>
            </div>
            <span className={`${fontClass} text-xs text-[#5a4a3a]`}>
              {formatDate(post.created_at)}
            </span>
            <span className={`${fontClass} text-xs text-[#5a4a3a]`}>
              👁 {post.view_count}
            </span>
          </div>

          {/* 이미지 */}
          {post.image_url && (
            <div className="mb-6 relative w-full max-h-[500px] overflow-hidden rounded border border-[#3d2d1f]">
              <Image
                src={post.image_url}
                alt={post.title}
                width={800}
                height={500}
                className="w-full h-auto object-contain"
              />
            </div>
          )}

          {/* 본문 */}
          <div className={`${fontClass} text-base text-[#c4b59d] leading-relaxed whitespace-pre-wrap`}>
            {post.content}
          </div>
        </article>

        {/* 댓글 섹션 */}
        <section className="dark-box p-6">
          <h2 className={`${fontClass} text-lg text-[#c03030] mb-4`}>
            {locale === "ko" ? `댓글 (${comments.length})` : `Comments (${comments.length})`}
          </h2>

          {/* 댓글 작성 폼 */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={locale === "ko" ? "댓글을 입력하세요..." : "Write a comment..."}
                className="w-full bg-[#1a1512] border-2 border-[#4a3828] text-[#e0d0b8] px-4 py-3 focus:border-[#c03030] focus:outline-none transition-colors resize-none h-24"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="blood-btn text-sm px-4 py-2 disabled:opacity-50"
                >
                  {submitting
                    ? "..."
                    : locale === "ko" ? "댓글 작성" : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <p className={`${fontClass} text-sm text-[#907050] mb-6`}>
              {locale === "ko" ? "댓글을 작성하려면 로그인하세요." : "Login to write a comment."}
            </p>
          )}

          {/* 댓글 목록 */}
          {comments.length === 0 ? (
            <p className={`${fontClass} text-sm text-[#5a4a3a]`}>
              {locale === "ko" ? "아직 댓글이 없습니다." : "No comments yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-[#3d2d1f] pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#8b0000] flex items-center justify-center text-white text-xs">
                        ?
                      </div>
                      <span className={`${fontClass} text-sm text-[#a08060]`}>
                        {locale === "ko" ? "익명" : "Anonymous"}
                      </span>
                      <span className={`${fontClass} text-xs text-[#5a4a3a]`}>
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className={`${fontClass} text-xs text-[#ff4444] hover:underline`}
                      >
                        {locale === "ko" ? "삭제" : "Delete"}
                      </button>
                    )}
                  </div>
                  <p className={`${fontClass} text-sm text-[#c4b59d] whitespace-pre-wrap`}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 목록으로 돌아가기 */}
        <div className="text-center mt-8">
          <Link href="/board">
            <span className={`${fontClass} text-sm text-[#907050] hover:text-[#c03030] transition-colors`}>
              ← {locale === "ko" ? "목록으로" : "Back to List"}
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
