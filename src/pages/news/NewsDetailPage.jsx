import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { mockNews } from '../../data/newsData';
import ReactMarkdown from "react-markdown";

const slugify = (text = "") =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const generateTOC = (markdown = "") => {
    const lines = markdown.split("\n");
    let h1Index = 0;
    let h2Index = 0;
    let h3Index = 0;

    return lines
        .map((line) => {
            if (line.startsWith("# ")) {
                h1Index++;
                h2Index = 0;
                h3Index = 0;
                return {
                    title: line.replace(/^# /, ""),
                    number: `${h1Index}`,
                    level: 1,
                    id: slugify(line.replace(/^# /, "")),
                };
            }
            if (line.startsWith("## ")) {
                h2Index++;
                h3Index = 0;
                if (h1Index === 0) h1Index = 1;
                return {
                    title: line.replace(/^## /, ""),
                    number: `${h1Index}.${h2Index}`,
                    level: 2,
                    id: slugify(`${h1Index}.${h2Index}-${line.replace(/^## /, "")}`),
                };
            }
            if (line.startsWith("### ")) {
                h3Index++;
                if (h1Index === 0) h1Index = 1;
                if (h2Index === 0) h2Index = 1;
                return {
                    title: line.replace(/^### /, ""),
                    number: `${h1Index}.${h2Index}.${h3Index}`,
                    level: 3,
                    id: slugify(`${h1Index}.${h2Index}.${h3Index}-${line.replace(/^### /, "")}`),
                };
            }
            return null;
        })
        .filter(Boolean);
};

const NewsDetailPage = () => {
    const { slug } = useParams();
    const [news, setNews] = useState(null);

    useEffect(() => {
        const id = slug?.split("-").pop();
        const found = mockNews.find(n => n.id === Number(id));
        if (found) {
            setNews(found);
        }
    }, [slug]);

    const toc = useMemo(() => generateTOC(news?.context), [news]);

    return (
        <div className="min-h-[calc(100vh-220px)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-10 lg:py-16">
            <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
                <div className="rounded-3xl border border-slate-700/40 bg-gradient-to-br from-slate-900/90 via-slate-850/80 to-slate-900/80 p-5 md:p-7 shadow-2xl shadow-black/45 backdrop-blur-md">
                    <div className="mb-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">Tin tức</p>
                        <h1 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">{news?.title || "Tiêu đề tin tức"}</h1>
                        <p className="text-sm text-slate-300 mt-2">{news?.date || "Ngày đăng"}</p>
                    </div>

                    <div className="flex flex-wrap justify-start gap-2 mb-4">
                        {news?.categories?.map((cat, idx) => (
                            <span key={`${cat}-${idx}`} className="rounded-full border border-indigo-300/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-indigo-200">
                                {cat}
                            </span>
                        ))}
                    </div>

                    {news?.description && (
                        <div className="rounded-xl border border-indigo-300/20 bg-slate-800/70 p-3 mb-4 text-sm text-slate-200">
                            <p className="font-medium text-indigo-200">Tóm tắt:</p>
                            <p className="mt-1">{news.description}</p>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/80 p-4 md:p-5 overflow-x-hidden">
                            {news ? (
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children, ...props }) => {
                                            const { jsx, ...rest } = props;
                                            const text = String(children);
                                            return (
                                                <h1 id={slugify(text)} className="text-3xl font-bold bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent my-6" {...rest}>
                                                    {children}
                                                </h1>
                                            );
                                        },
                                        h2: ({ children, ...props }) => {
                                            const { jsx, ...rest } = props;
                                            const text = String(children);
                                            return (
                                                <h2 id={slugify(text)} className="text-2xl font-semibold text-indigo-200 mt-6 mb-3" {...rest}>
                                                    {children}
                                                </h2>
                                            );
                                        },
                                        h3: ({ children, ...props }) => {
                                            const { jsx, ...rest } = props;
                                            const text = String(children);
                                            return (
                                                <h3 id={slugify(text)} className="text-xl font-semibold text-indigo-100 mt-5 mb-2" {...rest}>
                                                    {children}
                                                </h3>
                                            );
                                        },
                                        p: ({ ...props }) => <p className="text-slate-200 leading-7" {...props} />,
                                        ol: ({ ...props }) => <ol className="list-decimal pl-6 space-y-2 text-slate-200" {...props} />,
                                        ul: ({ ...props }) => <ul className="list-disc pl-6 space-y-2 text-slate-200" {...props} />,
                                        img: ({ ...props }) => <img className="w-full max-w-full h-auto rounded-md border border-slate-600/30" {...props} />,
                                        blockquote: ({ ...props }) => <blockquote className="border-l-4 border-indigo-300 pl-4 italic text-slate-300 my-3" {...props} />,
                                        code: ({ ...props }) => <code className="bg-slate-800 text-indigo-300 px-1 py-0.5 rounded-md" {...props} />,
                                        li: ({ ...props }) => <li className="text-slate-200" {...props} />,
                                    }}
                                >
                                    {news.context}
                                </ReactMarkdown>
                            ) : (
                                <div className="text-center text-slate-300 mt-6">Đang tải nội dung...</div>
                            )}
                        </div>

                        <aside className="rounded-2xl border border-indigo-400/20 bg-slate-900/70 p-4 lg:p-5 h-fit">
                            <h3 className="text-lg font-semibold text-white pb-2 border-b border-indigo-400/20">Mục lục</h3>
                            {toc.length > 0 ? (
                                <div className="space-y-2 mt-3">
                                    {toc.map((item, i) => (
                                        <button
                                            type="button"
                                            key={`${item.number}-${i}`}
                                            onClick={() => {
                                                const section = document.getElementById(item.id);
                                                if (section) {
                                                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }
                                            }}
                                            className={`group block w-full text-left text-sm text-slate-200 transition-all duration-300 hover:text-indigo-300 ${
                                                item.level === 1 ? "pl-0" : item.level === 2 ? "pl-4" : "pl-7"
                                            }`}
                                        >
                                            <span className="font-semibold text-indigo-300 mr-2 group-hover:text-indigo-200">{item.number}</span>
                                            <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1">{item.title}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 mt-2">Không có mục lục (chưa có tiêu đề H2/H3)</p>
                            )}
                        </aside>
                    </div>
                </div>
            </div>

            <div className="mt-8 mx-auto w-full max-w-6xl px-4 lg:px-0">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 lg:p-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Có thể bạn quan tâm</h3>
                        <a href="/news" className="text-indigo-300 hover:text-indigo-200 text-sm">Xem toàn bộ</a>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {mockNews.filter((item) => item.id !== news?.id).slice(0, 3).map((item) => (
                            <a
                                key={item.id}
                                href={`/news/${item.slug}-${item.id}`}
                                className="block rounded-xl border border-slate-600 bg-slate-800/80 p-3 transition-all duration-300 hover:border-indigo-400 hover:-translate-y-1 hover:bg-slate-700"
                            >
                                <div className="text-sm font-semibold text-white">{item.title}</div>
                                <div className="text-xs text-slate-300 mt-1">{item.date}</div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsDetailPage;