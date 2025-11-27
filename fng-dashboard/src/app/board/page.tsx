"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import { getPosts, Post } from "@/lib/board-api";
import LanguageSwitch from "@/components/LanguageSwitch";
import AuthButton from "@/components/AuthButton";

export default function BoardPage() {
  const { t, locale, fontClass } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<"fear" | "greed" | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    loadPosts();
  }, [page, category]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const result = await getPosts(category, page, limit);
      setPosts(result.posts);
      setTotal(result.total);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  return (
    <div className="min-h-screen bg-[#0d0a08] relative vignette grain">
      {/* 헤더 */}
      <header className="border-b-2 border-[#3d2d1f] bg-gradient-to-b from-[#1a1512] to-[#0d0a08] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
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
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 상단 컨트롤 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* 카테고리 필터 */}
          <div className="flex gap-2">
            <button
              onClick={() => { setCategory(undefined); setPage(1); }}
              className={`${fontClass} text-sm px-4 py-2 border-2 transition-all ${
                category === undefined
                  ? "border-[#c03030] bg-[#c03030] text-[#fff0f0]"
                  : "border-[#4a3828] text-[#a08060] hover:border-[#c03030]"
              }`}
            >
              {locale === "ko" ? "전체" : "All"}
            </button>
            <button
              onClick={() => { setCategory("fear"); setPage(1); }}
              className={`${fontClass} text-sm px-4 py-2 border-2 transition-all ${
                category === "fear"
                  ? "border-[#ff4444] bg-[#ff4444] text-white"
                  : "border-[#4a3828] text-[#ff4444] hover:border-[#ff4444]"
              }`}
            >
              {locale === "ko" ? "공포" : "Fear"}
            </button>
            <button
              onClick={() => { setCategory("greed"); setPage(1); }}
              className={`${fontClass} text-sm px-4 py-2 border-2 transition-all ${
                category === "greed"
                  ? "border-[#aa44ff] bg-[#aa44ff] text-white"
                  : "border-[#4a3828] text-[#aa44ff] hover:border-[#aa44ff]"
              }`}
            >
              {locale === "ko" ? "탐욕" : "Greed"}
            </button>
          </div>

          {/* 글쓰기 버튼 */}
          {user && (
            <Link href="/board/new">
              <button className={`${fontClass} blood-btn text-sm px-4 py-2`}>
                {locale === "ko" ? "글쓰기" : "Write"}
              </button>
            </Link>
          )}
        </div>

        {/* 게시글 목록 */}
        <div className="dark-box">
          {loading ? (
            <div className="p-8 text-center">
              <p className={`${fontClass} text-[#907050]`}>Loading...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`${fontClass} text-[#907050]`}>
                {locale === "ko" ? "게시글이 없습니다." : "No posts yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#3d2d1f]">
              {posts.map((post) => (
                <Link key={post.id} href={`/board/${post.id}`}>
                  <div className="p-4 hover:bg-[#1a1512] transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* 썸네일 */}
                      {post.image_url && (
                        <div className="flex-shrink-0 w-20 h-20 relative rounded overflow-hidden border border-[#3d2d1f]">
                          <Image
                            src={post.image_url}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`${fontClass} text-xs px-2 py-0.5 border ${getCategoryStyle(post.category)}`}>
                            {getCategoryLabel(post.category)}
                          </span>
                          <h3 className={`${fontClass} text-base text-[#e0d0b8] truncate`}>
                            {post.title}
                          </h3>
                        </div>
                        <p className={`${fontClass} text-sm text-[#907050] line-clamp-2`}>
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            {post.author_avatar_url ? (
                              <Image
                                src={post.author_avatar_url}
                                alt={post.author_name}
                                width={16}
                                height={16}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-[#8b0000] flex items-center justify-center text-white text-[8px]">
                                {post.author_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className={`${fontClass} text-xs text-[#a08060]`}>
                              {post.author_name}
                            </span>
                          </div>
                          <span className={`${fontClass} text-xs text-[#5a4a3a]`}>
                            {formatDate(post.created_at)}
                          </span>
                          <span className={`${fontClass} text-xs text-[#5a4a3a]`}>
                            👁 {post.view_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`${fontClass} dark-btn text-sm px-3 py-1 disabled:opacity-50`}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`${fontClass} text-sm px-3 py-1 border-2 transition-all ${
                    p === page
                      ? "border-[#c03030] bg-[#c03030] text-white"
                      : "border-[#4a3828] text-[#a08060] hover:border-[#c03030]"
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`${fontClass} dark-btn text-sm px-3 py-1 disabled:opacity-50`}
            >
              →
            </button>
          </div>
        )}

        {/* 대시보드로 돌아가기 */}
        <div className="text-center mt-8">
          <Link href="/dashboard">
            <span className={`${fontClass} text-sm text-[#907050] hover:text-[#c03030] transition-colors`}>
              ← {locale === "ko" ? "대시보드로 돌아가기" : "Back to Dashboard"}
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
