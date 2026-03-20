import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockNews } from '../../data/newsData';

const NewsListPage = () => {
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const categories = useMemo(() => {
        const cats = new Set();
        mockNews.forEach((item) => item.categories?.forEach((c) => cats.add(c)));
        return ['all', ...cats];
    }, []);

    const [visible, setVisible] = useState(new Set());
    const articleRefs = useRef([]);

    const filteredNews = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return mockNews.filter((item) => {
            const matchesCategory = categoryFilter === 'all' ? true : item.categories?.includes(categoryFilter);
            const matchesSearch =
                !term ||
                item.title.toLowerCase().includes(term) ||
                item.description.toLowerCase().includes(term) ||
                item.categories?.some((c) => c.toLowerCase().includes(term));
            return matchesCategory && matchesSearch;
        });
    }, [categoryFilter, searchTerm]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                setVisible((prev) => {
                    const next = new Set(prev);
                    let changed = false;
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const idx = Number(entry.target.getAttribute('data-index'));
                            if (!Number.isNaN(idx) && !next.has(idx)) {
                                next.add(idx);
                                changed = true;
                            }
                        }
                    });
                    return changed ? next : prev;
                });
            },
            { threshold: 0.2 }
        );

        articleRefs.current.forEach((node) => {
            if (node) observer.observe(node);
        });

        return () => {
            articleRefs.current.forEach((node) => {
                if (node) observer.unobserve(node);
            });
            observer.disconnect();
        };
    }, [filteredNews.length]);

    useEffect(() => {
        setVisible(new Set());
        articleRefs.current = [];
    }, [categoryFilter]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const categoryClass = (cat) => {
        const map = {
            Design: 'bg-pink-500/85 text-pink-50',
            Technology: 'bg-cyan-500/85 text-cyan-50',
            Development: 'bg-blue-500/85 text-blue-50',
            Marketing: 'bg-amber-500/85 text-amber-50',
            Business: 'bg-emerald-500/85 text-emerald-50',
            'UX/UI': 'bg-violet-500/85 text-violet-50',
            SEO: 'bg-emerald-500/85 text-emerald-50',
            Content: 'bg-fuchsia-500/85 text-fuchsia-50',
            Mobile: 'bg-sky-500/85 text-sky-50'
        };
        return map[cat] ?? 'bg-indigo-500/85 text-indigo-50';
    };

    return (
        <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white min-h-screen py-10 lg:py-14">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur">
                    <span className="inline-flex text-[11px] lg:text-[13px] font-semibold tracking-[0.3em] uppercase text-indigo-300 bg-indigo-900/30 px-3 py-1 rounded-full">
                        Nexgency News
                    </span>
                    <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black leading-tight bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent animate-[pulse_3s_ease-in-out_infinite]">
                        Khám phá kiến thức và xu hướng công nghệ
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                        Các bài viết cập nhật mới nhất về công nghệ, AI, marketing và thiết kế web.
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1.5fr_1fr] items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-300">Lọc:</span>
                            {categories.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCategoryFilter(c)}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                                        categoryFilter === c
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                            : 'bg-white/10 text-slate-200 hover:bg-indigo-500/30'
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 justify-end">
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm tiêu đề, mô tả, tag..."
                                className="w-full max-w-[280px] rounded-full border border-indigo-400/30 bg-slate-900/80 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-400/30"
                            />
                            <span className="text-xs text-slate-300">{filteredNews.length} bài viết</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                {filteredNews.length === 0 ? (
                    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-8 text-center text-slate-100">
                        <p className="text-lg font-semibold text-indigo-200">Không tìm thấy bài viết phù hợp.</p>
                        <p className="mt-2 text-sm text-slate-300">Vui lòng thử lại với từ khóa khác.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredNews.map((newsItem, index) => (
                            <Link
                            key={newsItem.id}
                            to={`/news/${newsItem.slug}-${newsItem.id}`}
                            state={{ news: newsItem }}
                            className="block"
                        >
                            <article
                                ref={(el) => { articleRefs.current[index] = el; }}
                                data-index={index}
                                className={`bg-gradient-to-br from-slate-900/95 via-slate-900/70 to-slate-800/80 border border-slate-600/40 rounded-2xl overflow-hidden shadow-2xl shadow-black/25 transform transition-all duration-500 ease-out ${
                                    visible.has(index)
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-100 translate-y-2'
                                } hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-400/60`}
                            >
                                <div className="relative overflow-hidden h-44 md:h-40">
                                    <img
                                        src={newsItem.thumbnail}
                                        alt={newsItem.title}
                                        className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                                    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                                        {(newsItem.categories ?? ['Tin tức']).map((cat) => (
                                            <span
                                                key={`${newsItem.id}-${cat}`}
                                                className={`text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded-full ${categoryClass(cat)}`}
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 md:p-5">
                                    <div className="flex items-center justify-between gap-2 text-[11px] uppercase font-semibold tracking-[0.1em] text-slate-300">
                                        <span className="text-slate-200">{formatDate(newsItem.date)}</span>
                                        <span className="text-indigo-300">{newsItem.tags?.slice(0, 2).join(' • ')}</span>
                                    </div>
                                    <h3 className="mt-2 text-lg font-bold text-slate-100 leading-snug line-clamp-2 hover:text-indigo-300 transition-colors duration-200">{newsItem.title}</h3>
                                    <p className="mt-2 text-sm text-slate-300 line-clamp-2">{newsItem.description}</p>
                                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-300">
                                        <span className="animate-pulse">Xem thêm</span>
                                        <span className="text-indigo-300">→</span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsListPage;
