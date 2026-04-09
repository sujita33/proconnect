import Link from "next/link";
import { HiOutlineChatBubbleLeft, HiOutlineHeart, HiOutlineBookmark } from "react-icons/hi2";

export default function ArticleCard({ article }) {
    const {
        _id,
        title,
        subtitle,
        coverImage,
        author,
        createdAt,
        readTime,
        likes,
        comments,
        tags,
    } = article;

    return (
        <div className="group bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 transition-all hover:border-green-200 dark:hover:border-green-500/30 hover:shadow-md flex items-center gap-4 relative">
            {/* Thumbnail / Cover Image */}
            <Link href={`/articles/${_id}`} className="flex-shrink-0">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                    <img
                        src={coverImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random`}
                        alt={title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {tags?.slice(0, 1).map((tag) => (
                        <span
                            key={tag}
                            className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider"
                        >
                            {tag}
                        </span>
                    ))}
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                        {readTime} min read
                    </span>
                </div>

                <Link href={`/articles/${_id}`}>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors truncate mb-1">
                        {title}
                    </h3>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                    {subtitle}
                </p>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                        <img
                            src={author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.name || "User")}`}
                            alt={author?.name}
                            className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                            {author?.name}
                        </span>
                    </div>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                    <span className="text-[11px] text-gray-400">
                        {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stats/Actions */}
            <div className="hidden md:flex flex-col items-center justify-center gap-2 pr-2">
                <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <HiOutlineHeart size={16} className={likes?.length > 0 ? "text-red-500 fill-current" : ""} />
                    <span className="text-[10px] font-bold">{likes?.length || 0}</span>
                </div>
                <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <HiOutlineChatBubbleLeft size={16} />
                    <span className="text-[10px] font-bold">{comments?.length || 0}</span>
                </div>
            </div>
        </div>
    );
}
