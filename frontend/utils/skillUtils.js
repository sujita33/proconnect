import React from "react";
import { FaJava, FaVuejs, FaFigma, FaCode } from "react-icons/fa";
import { SiJavascript, SiTypescript, SiPython, SiReact, SiNextdotjs, SiNodedotjs, SiHtml5, SiCss3, SiDocker, SiAmazon, SiGo, SiRust, SiKotlin, SiSwift, SiFlutter, SiMongodb, SiPostgresql, SiTailwindcss, SiGit, SiMysql, SiFirebase, SiSupabase, SiGraphql, SiRedux, SiSvelte, SiAngular, SiCplusplus, SiDotnet, SiPhp, SiRuby, SiLaravel, SiSpring, SiDjango, SiFlask, SiAndroid, SiJquery } from "react-icons/si";

// Helper to format raw StackOverflow tags (e.g., "react-native" -> "React Native")
export const formatDisplayName = (rawName) => {
    if (!rawName) return "";

    const overrides = {
        "html": "HTML",
        "css": "CSS",
        "javascript": "JavaScript", "js": "JavaScript",
        "typescript": "TypeScript", "ts": "TypeScript",
        "reactjs": "React", "react": "React",
        "next.js": "Next.js", "nextjs": "Next.js",
        "node.js": "Node.js", "nodejs": "Node.js",
        "vue.js": "Vue.js", "vuejs": "Vue.js",
        "angularjs": "Angular", "angular": "Angular",
        "c#": "C#", "csharp": "C#",
        "c++": "C++", "cpp": "C++",
        "php": "PHP", "sql": "SQL", "aws": "AWS",
        "ui": "UI Design", "ux": "UX Design",
        "android": "Android",
        "jquery": "jQuery",
        "postgresql": "PostgreSQL",
        "mongodb": "MongoDB",
    };

    if (overrides[rawName.toLowerCase()]) return overrides[rawName.toLowerCase()];

    // Default: Title Case and replace hyphens
    return rawName
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// Icon Mapping Helper
export const getSkillIcon = (skillName) => {
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = normalize(skillName);

    // Map normalized names to icons and specific colors
    const iconMap = {
        "javascript": <SiJavascript className="text-yellow-400" />,
        "js": <SiJavascript className="text-yellow-400" />,
        "typescript": <SiTypescript className="text-blue-600" />,
        "ts": <SiTypescript className="text-blue-600" />,
        "python": <SiPython className="text-blue-500" />,
        "reactjs": <SiReact className="text-cyan-400" />,
        "react": <SiReact className="text-cyan-400" />,
        "reactnative": <SiReact className="text-cyan-400" />,
        "nextjs": <SiNextdotjs className="text-black" />,
        "nodejs": <SiNodedotjs className="text-green-600" />,
        "node": <SiNodedotjs className="text-green-600" />,
        "html": <SiHtml5 className="text-orange-500" />,
        "html5": <SiHtml5 className="text-orange-500" />,
        "css": <SiCss3 className="text-blue-500" />,
        "css3": <SiCss3 className="text-blue-500" />,
        "java": <FaJava className="text-red-500" />,
        "c": <SiCplusplus className="text-blue-600" />,
        "cpp": <SiCplusplus className="text-blue-600" />,
        "cplusplus": <SiCplusplus className="text-blue-600" />,
        "csharp": <SiDotnet className="text-purple-600" />,
        "go": <SiGo className="text-cyan-600" />,
        "golang": <SiGo className="text-cyan-600" />,
        "rust": <SiRust className="text-orange-600" />,
        "kotlin": <SiKotlin className="text-purple-600" />,
        "swift": <SiSwift className="text-orange-500" />,
        "flutter": <SiFlutter className="text-cyan-500" />,
        "php": <SiPhp className="text-indigo-400" />,
        "ruby": <SiRuby className="text-red-600" />,
        "rails": <SiRuby className="text-red-600" />,
        "laravel": <SiLaravel className="text-red-500" />,
        "django": <SiDjango className="text-green-700" />,
        "flask": <SiFlask className="text-gray-600" />,
        "spring": <SiSpring className="text-green-500" />,
        "docker": <SiDocker className="text-blue-500" />,
        "aws": <SiAmazon className="text-orange-400" />,
        "amazonwebservices": <SiAmazon className="text-orange-400" />,
        "mongodb": <SiMongodb className="text-green-500" />,
        "postgres": <SiPostgresql className="text-blue-400" />,
        "postgresql": <SiPostgresql className="text-blue-400" />,
        "sql": <SiPostgresql className="text-blue-400" />,
        "mysql": <SiMysql className="text-blue-500" />,
        "firebase": <SiFirebase className="text-yellow-500" />,
        "supabase": <SiSupabase className="text-green-400" />,
        "graphql": <SiGraphql className="text-pink-600" />,
        "redux": <SiRedux className="text-purple-500" />,
        "tailwind": <SiTailwindcss className="text-cyan-400" />,
        "tailwindcss": <SiTailwindcss className="text-cyan-400" />,
        "git": <SiGit className="text-orange-500" />,
        "figma": <FaFigma className="text-purple-500" />,
        "vue": <FaVuejs className="text-green-500" />,
        "vuejs": <FaVuejs className="text-green-500" />,
        "angular": <SiAngular className="text-red-600" />,
        "svelte": <SiSvelte className="text-orange-500" />,
        "android": <SiAndroid className="text-green-500" />,
        "jquery": <SiJquery className="text-blue-600" />,
    };

    return iconMap[name] || <FaCode className="text-gray-400" />;
};
