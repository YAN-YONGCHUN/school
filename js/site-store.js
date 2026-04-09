(function () {
    const USERS_KEY = "peak_users";
    const CURRENT_USER_KEY = "peak_current_user";
    const SUBMISSIONS_KEY = "peak_submissions";
    const POSTS_KEY = "peak_posts";
    const BOOKINGS_KEY = "peak_lab_bookings";
    const RESOURCE_FAVORITES_KEY = "peak_resource_favorites";
    const COURSE_PLAN_KEY = "peak_course_plans";
    const CHECKLIST_KEY = "peak_competition_checklist";
    const COURSE_TASKS_KEY = "peak_course_tasks";

    const seedUsers = [
        {
            id: "001",
            name: "闫永春",
            studentId: "20241204070",
            college: "计算机科学与技术学院",
            major: "计算机科学与技术",
            email: "demo@campus.edu.cn",
            password: "123456",
            direction: "人工智能",
            bio: "相信智能视觉正在改变世界，期待用技术让校园生活更美好。",
            createdAt: "2026-04-01 10:30:00"
        }
    ];

    const seedSubmissions = [
        {
            id: "join-1",
            userName: "李晨熙",
            major: "软件工程",
            grade: "2024级",
            direction: "Web 全栈",
            contact: "lichenxi@example.com",
            idea: "想做一个服务社团活动宣传与报名的统一平台，让页面展示和数据管理结合起来。",
            createdAt: "2026-04-07 18:20:00"
        },
        {
            id: "join-2",
            userName: "周语桐",
            major: "计算机科学与技术",
            grade: "2023级",
            direction: "人工智能",
            contact: "zhouyutong@example.com",
            idea: "希望做一个帮助新生快速找到学习资料和实验室活动的智能推荐页面。",
            createdAt: "2026-04-08 20:35:00"
        },
        {
            id: "join-3",
            userName: "吴昊然",
            major: "网络工程",
            grade: "2022级",
            direction: "网络安全",
            contact: "wuhaoran@example.com",
            idea: "计划制作校园网络安全宣传专题站，结合案例、演示和互动问答提升同学安全意识。",
            createdAt: "2026-04-09 09:10:00"
        }
    ];

    const seedPosts = [
        {
            id: "post-1",
            title: "想组队做一个校园活动可视化平台，有前端同学一起吗？",
            content: "我想把活动报名、海报展示、签到统计和数据看板做成一个完整站点，适合比赛也能服务社团运营。希望找 1 位前端、1 位数据可视化方向同学一起合作。",
            author: "演示同学",
            direction: "Web 全栈",
            tags: ["组队", "网页设计", "可视化"],
            createdAt: "2026-04-09 19:30:00",
            likes: 18,
            stars: 9,
            comments: 6,
            likedBy: [],
            starredBy: []
        },
        {
            id: "post-2",
            title: "AI 方向作品答辩时，怎么讲“校园价值”会更打动评委？",
            content: "我发现很多 AI 项目技术上很完整，但答辩容易陷入只讲模型。有没有学长学姐愿意分享一下，怎么把作品和学校场景、师生需求结合起来讲？",
            author: "周语桐",
            direction: "人工智能",
            tags: ["答辩", "AI", "经验"],
            createdAt: "2026-04-09 20:10:00",
            likes: 24,
            stars: 11,
            comments: 8,
            likedBy: [],
            starredBy: []
        },
        {
            id: "post-3",
            title: "网络安全方向也可以做出很有展示感的网页作品",
            content: "不一定只有全栈和 AI 才适合比赛。比如做校园安全知识专题站、风险演示页、案例交互页面，也很适合网页设计赛道，而且主题很正。",
            author: "吴昊然",
            direction: "网络安全",
            tags: ["安全", "专题站", "比赛思路"],
            createdAt: "2026-04-09 21:05:00",
            likes: 15,
            stars: 12,
            comments: 4,
            likedBy: [],
            starredBy: []
        }
    ];

    const seedLabBookings = [
        {
            id: "booking-1",
            userId: "user-1001",
            userName: "演示同学",
            contact: "demo@campus.edu.cn",
            lab: "创新实验室（硬件实验室）",
            slot: "周三 19:00-21:00",
            topic: "校园活动可视化原型联调",
            status: "已确认",
            createdAt: "2026-04-09 18:40:00"
        },
        {
            id: "booking-2",
            userId: "user-1001",
            userName: "演示同学",
            contact: "demo@campus.edu.cn",
            lab: "算法实验室",
            slot: "周五 14:00-16:00",
            topic: "比赛答辩展示彩排",
            status: "待沟通",
            createdAt: "2026-04-10 09:15:00"
        }
    ];

    const seedChecklist = {
        theme_fit: true,
        pages_ready: true,
        interaction_ready: true,
        mobile_ready: false,
        docs_ready: false
    };

    const seedCourseTasks = [
        {
            id: "task-1",
            actor: "user-1001",
            title: "补齐答辩主线中的校园价值表达",
            done: false,
            createdAt: "2026-04-10 10:30:00"
        },
        {
            id: "task-2",
            actor: "user-1001",
            title: "优化移动端导航和关键交互动效",
            done: true,
            createdAt: "2026-04-10 11:00:00"
        }
    ];

    function read(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function now() {
        const date = new Date();
        const pad = (value) => String(value).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    function uid(prefix) {
        return `${prefix}-${Date.now()}`;
    }

    function normalizeLabName(name) {
        const map = {
            "智算实验室": "人工智能实验室",
            "全栈工坊": "创新实验室（硬件实验室）",
            "网络攻防角": "网络安全实验室",
            "创客联合站": "算法实验室"
        };
        return map[String(name || "").trim()] || String(name || "").trim();
    }

    function normalizeBookings(items) {
        return (Array.isArray(items) ? items : []).map((item) => ({
            ...item,
            lab: normalizeLabName(item.lab)
        }));
    }

    function ensureDemoUser(items) {
        const users = Array.isArray(items) ? items.slice() : [];
        const seed = seedUsers[0];
        const seedEmail = String(seed.email || "").trim().toLowerCase();
        const seedStudentId = String(seed.studentId || "").trim();

        const index = users.findIndex((item) => {
            const email = String(item?.email || "").trim().toLowerCase();
            const studentId = String(item?.studentId || "").trim();
            return email === seedEmail || studentId === seedStudentId || String(item?.id || "") === String(seed.id || "");
        });

        const merged = {
            ...seed,
            ...(index >= 0 ? users[index] : {}),
            id: seed.id,
            email: seedEmail,
            studentId: seedStudentId,
            password: seed.password
        };

        if (index >= 0) {
            users[index] = merged;
        } else {
            users.unshift(merged);
        }

        return users;
    }

    function actorId() {
        const current = getCurrentUser();
        return current ? current.id : "guest";
    }

    function init() {
        if (!localStorage.getItem(USERS_KEY)) write(USERS_KEY, seedUsers);
        if (!localStorage.getItem(SUBMISSIONS_KEY)) write(SUBMISSIONS_KEY, seedSubmissions);
        if (!localStorage.getItem(POSTS_KEY)) write(POSTS_KEY, seedPosts);
        if (!localStorage.getItem(BOOKINGS_KEY)) write(BOOKINGS_KEY, seedLabBookings);
        if (!localStorage.getItem(RESOURCE_FAVORITES_KEY)) write(RESOURCE_FAVORITES_KEY, []);
        if (!localStorage.getItem(COURSE_PLAN_KEY)) write(COURSE_PLAN_KEY, {});
        if (!localStorage.getItem(CHECKLIST_KEY)) write(CHECKLIST_KEY, seedChecklist);
        if (!localStorage.getItem(COURSE_TASKS_KEY)) write(COURSE_TASKS_KEY, seedCourseTasks);

        const users = read(USERS_KEY, seedUsers.slice());
        write(USERS_KEY, ensureDemoUser(users));

        const bookings = read(BOOKINGS_KEY, seedLabBookings.slice());
        write(BOOKINGS_KEY, normalizeBookings(bookings));
    }

    function getUsers() {
        return read(USERS_KEY, seedUsers.slice());
    }

    function getCurrentUser() {
        return read(CURRENT_USER_KEY, null);
    }

    function setCurrentUser(user) {
        write(CURRENT_USER_KEY, user);
    }

    function logout() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    function register(payload) {
        const users = getUsers();
        const email = String(payload.email || "").trim().toLowerCase();
        const studentId = String(payload.studentId || "").trim();

        if (users.some((user) => user.email === email)) {
            throw new Error("该邮箱已注册，请直接登录。");
        }

        if (users.some((user) => user.studentId === studentId)) {
            throw new Error("该学号已存在，请检查后重试。");
        }

        const user = {
            id: uid("user"),
            name: String(payload.name || "").trim(),
            studentId,
            college: String(payload.college || "").trim(),
            major: String(payload.major || "").trim(),
            email,
            password: String(payload.password || ""),
            direction: String(payload.direction || "").trim(),
            bio: String(payload.bio || "").trim(),
            createdAt: now()
        };

        users.unshift(user);
        write(USERS_KEY, users);
        setCurrentUser(publicUser(user));
        return user;
    }

    function publicUser(user) {
        return {
            id: user.id,
            name: user.name,
            studentId: user.studentId,
            college: user.college,
            major: user.major,
            email: user.email,
            direction: user.direction,
            bio: user.bio,
            createdAt: user.createdAt
        };
    }

    function login(payload) {
        const account = String(payload.account || "").trim().toLowerCase();
        const password = String(payload.password || "");
        const user = getUsers().find(
            (item) => item.email.toLowerCase() === account || item.studentId === account
        );

        if (!user || user.password !== password) {
            throw new Error("账号或密码错误。");
        }

        setCurrentUser(publicUser(user));
        return user;
    }

    function updateCurrentUserProfile(payload) {
        const current = getCurrentUser();
        if (!current) throw new Error("请先登录。");

        const users = getUsers();
        const index = users.findIndex((item) => item.id === current.id);
        if (index < 0) throw new Error("用户不存在。");

        users[index] = {
            ...users[index],
            name: String(payload.name || "").trim(),
            college: String(payload.college || "").trim(),
            major: String(payload.major || "").trim(),
            direction: String(payload.direction || "").trim(),
            bio: String(payload.bio || "").trim()
        };

        write(USERS_KEY, users);
        setCurrentUser(publicUser(users[index]));
        return users[index];
    }

    function getSubmissions() {
        return read(SUBMISSIONS_KEY, seedSubmissions.slice());
    }

    function submitJoin(payload) {
        const submissions = getSubmissions();
        const item = {
            id: uid("join"),
            userName: String(payload.userName || "").trim(),
            major: String(payload.major || "").trim(),
            grade: String(payload.grade || "").trim(),
            direction: String(payload.direction || "").trim(),
            contact: String(payload.contact || "").trim(),
            idea: String(payload.idea || "").trim(),
            createdAt: now()
        };
        submissions.unshift(item);
        write(SUBMISSIONS_KEY, submissions);
        return item;
    }

    function getPosts() {
        return read(POSTS_KEY, seedPosts.slice());
    }

    function addPost(payload) {
        const current = getCurrentUser();
        const item = {
            id: uid("post"),
            title: String(payload.title || "").trim(),
            content: String(payload.content || "").trim(),
            author: current ? current.name : "游客用户",
            direction: String(payload.direction || "").trim(),
            tags: String(payload.tags || "")
                .split(/[，,\s]+/)
                .map((tag) => tag.trim())
                .filter(Boolean)
                .slice(0, 5),
            createdAt: now(),
            likes: 0,
            stars: 0,
            comments: Math.floor(Math.random() * 4),
            likedBy: [],
            starredBy: []
        };
        const posts = getPosts();
        posts.unshift(item);
        write(POSTS_KEY, posts);
        return item;
    }

    function togglePostReaction(postId, key) {
        const posts = getPosts();
        const index = posts.findIndex((item) => item.id === postId);
        if (index < 0) return null;

        const id = actorId();
        const memberKey = key === "likes" ? "likedBy" : "starredBy";
        const list = Array.isArray(posts[index][memberKey]) ? posts[index][memberKey] : [];
        const exists = list.includes(id);

        posts[index][memberKey] = exists ? list.filter((item) => item !== id) : list.concat(id);
        posts[index][key] = posts[index][memberKey].length + (key === "likes" ? 12 : 6);
        write(POSTS_KEY, posts);
        return posts[index];
    }

    function getOverview() {
        const users = getUsers();
        const submissions = getSubmissions();
        return {
            activeLabs: 4,
            liveProjects: 24,
            communityMembers: users.length + 185,
            weeklyEvents: 9,
            submissions: submissions.length
        };
    }

    function getDashboard() {
        const submissions = getSubmissions();
        const bookings = getLabBookings();
        const favorites = getFavoriteResources();
        const directionSeed = {
            "人工智能": 2,
            "Web 全栈": 2,
            "软件工程": 2,
            "网络安全": 2
        };

        submissions.forEach((item) => {
            if (directionSeed[item.direction] !== undefined) {
                directionSeed[item.direction] += 1;
            }
        });

        return {
            summary: [
                {
                    label: "页面总量",
                    value: 11,
                    text: "覆盖展示、服务、社区、账号与驾驶舱的完整前端作品结构。"
                },
                {
                    label: "注册账户",
                    value: getUsers().length,
                    text: "通过完整账户模块实现登录、注册与个人中心体验。"
                },
                {
                    label: "社区报名",
                    value: submissions.length,
                    text: "报名数据会实时进入平台看板，形成站内交互闭环。"
                },
                {
                    label: "交流帖子",
                    value: getPosts().length,
                    text: "交流社区支持发帖、点赞、收藏、搜索和方向筛选。"
                },
                {
                    label: "空间预约",
                    value: bookings.length,
                    text: "实验空间预约与彩排安排沉淀到统一记录中。"
                },
                {
                    label: "资源收藏",
                    value: favorites.length,
                    text: "服务中心高频资料支持收藏，便于答辩准备与复用。"
                }
            ],
            directionStats: Object.keys(directionSeed).map((name) => ({
                name,
                count: directionSeed[name],
                percent: Math.min(100, directionSeed[name] * 12)
            })),
            submissions,
            activities: getActivityFeed().slice(0, 6)
        };
    }

    function getMySubmissions() {
        const current = getCurrentUser();
        if (!current) return [];
        return getSubmissions().filter((item) => item.userName === current.name || item.contact === current.email);
    }

    function getMyPosts() {
        const current = getCurrentUser();
        if (!current) return [];
        return getPosts().filter((item) => item.author === current.name);
    }

    function getCommunityStats() {
        const posts = getPosts();
        const tags = posts.flatMap((item) => item.tags || []);
        const tagCount = tags.reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {});

        const hotTags = Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count]) => ({ name, count }));

        return {
            totalPosts: posts.length,
            totalLikes: posts.reduce((sum, item) => sum + (item.likes || 0), 0),
            totalStars: posts.reduce((sum, item) => sum + (item.stars || 0), 0),
            hotTags
        };
    }

    function getLabBookings() {
        return normalizeBookings(read(BOOKINGS_KEY, seedLabBookings.slice()));
    }

    function bookLab(payload) {
        const current = getCurrentUser();
        const bookings = getLabBookings();
        const item = {
            id: uid("booking"),
            userId: current ? current.id : "guest",
            userName: current ? current.name : String(payload.userName || "访客用户").trim(),
            contact: String(payload.contact || (current ? current.email : "")).trim(),
            lab: normalizeLabName(payload.lab),
            slot: String(payload.slot || "").trim(),
            topic: String(payload.topic || "").trim(),
            status: "待沟通",
            createdAt: now()
        };
        bookings.unshift(item);
        write(BOOKINGS_KEY, bookings);
        return item;
    }

    function getMyLabBookings() {
        const current = getCurrentUser();
        if (!current) return [];
        return getLabBookings().filter((item) => item.userId === current.id || item.contact === current.email);
    }

    function getFavoriteResources() {
        return read(RESOURCE_FAVORITES_KEY, []);
    }

    function toggleFavoriteResource(resourceId) {
        const list = getFavoriteResources();
        const next = list.includes(resourceId)
            ? list.filter((item) => item !== resourceId)
            : list.concat(resourceId);
        write(RESOURCE_FAVORITES_KEY, next);
        return next;
    }

    function getCoursePlan() {
        const plans = read(COURSE_PLAN_KEY, {});
        const current = getCurrentUser();
        const actor = current ? current.id : "guest";
        return plans[actor] || null;
    }

    function saveCoursePlan(payload) {
        const plans = read(COURSE_PLAN_KEY, {});
        const current = getCurrentUser();
        const actor = current ? current.id : "guest";
        const item = {
            id: `plan-${actor}`,
            actor,
            target: String(payload.target || "").trim(),
            weeklyHours: String(payload.weeklyHours || "").trim(),
            preferredDirection: String(payload.preferredDirection || "").trim(),
            summary: String(payload.summary || "").trim(),
            milestones: Array.isArray(payload.milestones) ? payload.milestones.slice(0, 4) : [],
            updatedAt: now()
        };
        plans[actor] = item;
        write(COURSE_PLAN_KEY, plans);
        return item;
    }

    function getActivityFeed() {
        const postFeed = getPosts().map((item) => ({
            type: "post",
            title: item.title,
            meta: item.author,
            createdAt: item.createdAt
        }));

        const joinFeed = getSubmissions().map((item) => ({
            type: "submission",
            title: item.idea,
            meta: item.userName,
            createdAt: item.createdAt
        }));

        const bookingFeed = getLabBookings().map((item) => ({
            type: "booking",
            title: `${item.lab} · ${item.topic}`,
            meta: item.userName,
            createdAt: item.createdAt
        }));

        return postFeed
            .concat(joinFeed, bookingFeed)
            .sort((a, b) => new Date(String(b.createdAt).replace(/-/g, "/")) - new Date(String(a.createdAt).replace(/-/g, "/")));
    }

    function getCompetitionChecklist() {
        return read(CHECKLIST_KEY, { ...seedChecklist });
    }

    function setChecklistItem(key, done) {
        const checklist = getCompetitionChecklist();
        checklist[key] = Boolean(done);
        write(CHECKLIST_KEY, checklist);
        return checklist;
    }

    function getCourseTasks() {
        const actor = actorId();
        return read(COURSE_TASKS_KEY, seedCourseTasks.slice())
            .filter((item) => item.actor === actor)
            .sort((a, b) => new Date(String(b.createdAt).replace(/-/g, "/")) - new Date(String(a.createdAt).replace(/-/g, "/")));
    }

    function addCourseTask(payload) {
        const tasks = read(COURSE_TASKS_KEY, seedCourseTasks.slice());
        const item = {
            id: uid("task"),
            actor: actorId(),
            title: String(payload.title || "").trim(),
            done: false,
            createdAt: now()
        };
        tasks.unshift(item);
        write(COURSE_TASKS_KEY, tasks);
        return item;
    }

    function toggleCourseTask(taskId) {
        const tasks = read(COURSE_TASKS_KEY, seedCourseTasks.slice());
        const index = tasks.findIndex((item) => item.id === taskId && item.actor === actorId());
        if (index < 0) return null;
        tasks[index].done = !tasks[index].done;
        write(COURSE_TASKS_KEY, tasks);
        return tasks[index];
    }

    function removeCourseTask(taskId) {
        const tasks = read(COURSE_TASKS_KEY, seedCourseTasks.slice());
        const next = tasks.filter((item) => !(item.id === taskId && item.actor === actorId()));
        write(COURSE_TASKS_KEY, next);
        return next;
    }

    init();

    window.siteStore = {
        getUsers,
        getCurrentUser,
        register,
        login,
        logout,
        updateCurrentUserProfile,
        getSubmissions,
        submitJoin,
        getPosts,
        addPost,
        togglePostLike(postId) {
            return togglePostReaction(postId, "likes");
        },
        togglePostStar(postId) {
            return togglePostReaction(postId, "stars");
        },
        getOverview,
        getDashboard,
        getMySubmissions,
        getMyPosts,
        getCommunityStats,
        getLabBookings,
        bookLab,
        getMyLabBookings,
        getFavoriteResources,
        toggleFavoriteResource,
        getCoursePlan,
        saveCoursePlan,
        getActivityFeed,
        getCompetitionChecklist,
        setChecklistItem,
        getCourseTasks,
        addCourseTask,
        toggleCourseTask,
        removeCourseTask
    };
})();
