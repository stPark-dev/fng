"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import { getPost, updatePost, uploadPostImage, Post } from "@/lib/board-api";
import LanguageSwitch from "@/components/LanguageSwitch";
import AuthButton from "@/components/AuthButton";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { locale, fontClass } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"fear" | "greed">("fear");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadPost = useCallback(async () => {
    setLoading(true);
    try {
      const postData = await getPost(postId);
      if (!postData) {
        router.push("/board");
        return;
      }
      setPost(postData);
      setTitle(postData.title);
      setContent(postData.content);
      setCategory(postData.category);
      setExistingImageUrl(postData.image_url);
      setPreviewUrl(postData.image_url);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      router.push("/board");
    } finally {
      setLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    // 로그인 체크 및 작성자 체크
    if (!authLoading && !loading) {
      if (!user) {
        router.push("/login");
      } else if (post && user.id !== post.user_id) {
        router.push(`/board/${postId}`);
      }
    }
  }, [user, authLoading, post, loading, router, postId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        locale === "ko" ? "이미지 파일만 업로드 가능합니다." : "Only image files are allowed."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        locale === "ko" ? "파일 크기는 10MB 이하여야 합니다." : "File size must be under 10MB."
      );
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post) return;

    if (!title.trim()) {
      setError(locale === "ko" ? "제목을 입력하세요." : "Please enter a title.");
      return;
    }

    if (!content.trim()) {
      setError(locale === "ko" ? "내용을 입력하세요." : "Please enter content.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      let imageUrl: string | undefined = existingImageUrl || undefined;

      // 새 이미지 업로드
      if (selectedFile) {
        imageUrl = await uploadPostImage(selectedFile, user.id);
      }

      // 게시글 수정
      await updatePost(postId, {
        title: title.trim(),
        content: content.trim(),
        category,
        image_url: imageUrl,
      });

      router.push(`/board/${postId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : locale === "ko"
          ? "오류가 발생했습니다."
          : "An error occurred."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0d0a08] flex items-center justify-center">
        <p className={`${fontClass} text-[#907050]`}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0a08] relative vignette grain">
      {/* 헤더 */}
      <header className="border-b-2 border-[#3d2d1f] bg-linear-to-b from-[#1a1512] to-[#0d0a08] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/board">
              <h1
                className={`${fontClass} text-xl text-[#e0d0b8] hover:text-[#c03030] transition-colors cursor-pointer`}
              >
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
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="dark-box p-6">
          <h2 className={`${fontClass} text-xl text-[#c03030] mb-6`}>
            {locale === "ko" ? "글 수정" : "Edit Post"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 카테고리 선택 */}
            <div>
              <label className={`${fontClass} text-sm text-[#a08060] block mb-2`}>
                {locale === "ko" ? "카테고리" : "Category"}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="fear"
                    checked={category === "fear"}
                    onChange={() => setCategory("fear")}
                    className="hidden"
                  />
                  <span
                    className={`${fontClass} text-sm px-4 py-2 border-2 transition-all ${
                      category === "fear"
                        ? "border-[#ff4444] bg-[#ff4444] text-white"
                        : "border-[#4a3828] text-[#ff4444] hover:border-[#ff4444]"
                    }`}
                  >
                    {locale === "ko" ? "공포" : "Fear"}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="greed"
                    checked={category === "greed"}
                    onChange={() => setCategory("greed")}
                    className="hidden"
                  />
                  <span
                    className={`${fontClass} text-sm px-4 py-2 border-2 transition-all ${
                      category === "greed"
                        ? "border-[#aa44ff] bg-[#aa44ff] text-white"
                        : "border-[#4a3828] text-[#aa44ff] hover:border-[#aa44ff]"
                    }`}
                  >
                    {locale === "ko" ? "탐욕" : "Greed"}
                  </span>
                </label>
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className={`${fontClass} text-sm text-[#a08060] block mb-2`}>
                {locale === "ko" ? "제목" : "Title"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder={locale === "ko" ? "제목을 입력하세요" : "Enter title"}
                className="w-full bg-[#1a1512] border-2 border-[#4a3828] text-[#e0d0b8] px-4 py-3 focus:border-[#c03030] focus:outline-none transition-colors"
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className={`${fontClass} text-sm text-[#a08060] block mb-2`}>
                {locale === "ko" ? "이미지 (선택)" : "Image (Optional)"}
              </label>

              {previewUrl ? (
                <div className="flex justify-center">
                  <div className="relative max-w-md">
                    <div className="rounded border border-[#3d2d1f]">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={400}
                        height={600}
                        className="w-full h-auto"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-[#ff4444] text-white rounded-full flex items-center justify-center hover:bg-[#cc3333] transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#4a3828] p-8 text-center cursor-pointer hover:border-[#c03030] transition-colors"
                >
                  <p className={`${fontClass} text-sm text-[#907050]`}>
                    {locale === "ko"
                      ? "클릭하여 이미지를 선택하세요 (WebP로 자동 변환)"
                      : "Click to select an image (auto-converted to WebP)"}
                  </p>
                  <p className={`${fontClass} text-xs text-[#5a4a3a] mt-2`}>
                    {locale === "ko" ? "최대 10MB" : "Max 10MB"}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* 내용 */}
            <div>
              <label className={`${fontClass} text-sm text-[#a08060] block mb-2`}>
                {locale === "ko" ? "내용" : "Content"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={locale === "ko" ? "내용을 입력하세요" : "Enter content"}
                rows={10}
                className="w-full bg-[#1a1512] border-2 border-[#4a3828] text-[#e0d0b8] px-4 py-3 focus:border-[#c03030] focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* 에러 메시지 */}
            {error && <p className={`${fontClass} text-sm text-[#ff4444]`}>{error}</p>}

            {/* 버튼 */}
            <div className="flex gap-4">
              <Link href={`/board/${postId}`} className="flex-1">
                <button type="button" className={`${fontClass} dark-btn w-full text-sm px-4 py-2`}>
                  {locale === "ko" ? "취소" : "Cancel"}
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className={`${fontClass} blood-btn flex-1 text-sm px-4 py-2 disabled:opacity-50`}
              >
                {submitting
                  ? locale === "ko"
                    ? "저장 중..."
                    : "Saving..."
                  : locale === "ko"
                  ? "저장"
                  : "Save"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
