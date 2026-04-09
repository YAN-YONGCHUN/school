(function () {
    const data = window.siteData || {};
    const store = window.siteStore;
    const page = document.body.dataset.page || "";
    let activeCommunityTag = "";
    let revealObserver = null;
    let counterObserver = null;

    function qs(selector) {
        return document.querySelector(selector);
    }

    function qsa(selector) {
        return Array.from(document.querySelectorAll(selector));
    }

    function render(target, html) {
        const node = qs(target);
        if (node) node.innerHTML = html;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function dateValue(value) {
        return new Date(String(value || "").replace(/-/g, "/")).getTime() || 0;
    }

    function formatRelativeTime(value) {
        const time = dateValue(value);
        const diff = Date.now() - time;
        if (!time || diff < 0) return value || "";
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "刚刚";
        if (minutes < 60) return `${minutes} 分钟前`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} 小时前`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} 天前`;
        return value || "";
    }

    function renderActions(actions) {
        if (!actions || !actions.length) return "";
        return `
            <div class="card-actions">
                ${actions.map((action) => `
                    <a class="button ${action.variant || "button-ghost"}" href="${action.href}">
                        ${action.label}
                    </a>
                `).join("")}
            </div>
        `;
    }

    function renderTimeline(target, items) {
        render(
            target,
            items.map((item, index) => `
                <li data-index="${index + 1}">
                    <strong>${item.title}</strong>
                    <span>${item.text}</span>
                </li>
            `).join("")
        );
    }

    function renderTableBody(target, rows) {
        render(
            target,
            rows.map((row) => `
                <tr>
                    ${row.map((cell) => `<td>${cell}</td>`).join("")}
                </tr>
            `).join("")
        );
    }

    function applyBranding() {
        qsa("[data-brand-name]").forEach((node) => {
            node.textContent = data.brand.name;
        });
        qsa("[data-brand-subtitle]").forEach((node) => {
            node.textContent = data.brand.subtitle;
        });
        qsa("[data-school-name]").forEach((node) => {
            node.textContent = data.campus.schoolName;
        });
        qsa("[data-college-name]").forEach((node) => {
            node.textContent = data.campus.collegeName;
        });
        qsa("[data-contest-name]").forEach((node) => {
            node.textContent = data.campus.contestName;
        });
        qsa("[data-campus-location]").forEach((node) => {
            node.textContent = data.campus.location;
        });
        qsa("[data-logo-text]").forEach((node) => {
            node.innerHTML = `<img class="brand-icon" src="assets/peak-logo.svg" alt="${escapeHtml(data.brand.name)} 标志">`;
        });
    }

    function setupNav() {
        const pathname = window.location.pathname.split("/").pop() || "index.html";
        const nav = qs(".nav-links");
        const items = [
            { label: "首页", href: "index.html" },
            { label: "学科全景", href: "detail.html" },
            { label: "实验空间", href: "spots.html" },
            { label: "课程图谱", href: "rent.html" },
            { label: "协同育人", href: "partner.html" },
            { label: "成果荣誉", href: "badge.html" },
            { label: "创新社区", href: "community.html" },
            { label: "智慧服务", href: "admin-login.html" },
            { label: "数据驾驶舱", href: "admin.html", cta: true }
        ];

        if (nav) {
            nav.innerHTML = items.map((item) => `
                <a
                    ${item.cta ? 'class="nav-cta"' : ""}
                    data-link
                    href="${item.href}"
                >
                    ${item.label}
                </a>
            `).join("");
        }

        qsa(".nav-links a[data-link]").forEach((link) => {
            if (link.getAttribute("href") === pathname) {
                link.classList.add("is-active");
                link.setAttribute("aria-current", "page");
            }
        });

        const toggle = qs(".nav-toggle");
        if (toggle && nav) {
            const isMobile = () => window.matchMedia("(max-width: 760px)").matches;
            const setNavOpen = (open) => {
                nav.classList.toggle("is-open", open);
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            };

            setNavOpen(false);

            toggle.addEventListener("click", (event) => {
                event.stopPropagation();
                setNavOpen(!nav.classList.contains("is-open"));
            });

            nav.addEventListener("click", (event) => {
                if (event.target.closest("a[data-link]")) {
                    setNavOpen(false);
                }
            });

            document.addEventListener("click", (event) => {
                if (!isMobile() || !nav.classList.contains("is-open")) return;
                if (event.target.closest(".nav-links") || event.target.closest(".nav-toggle")) return;
                setNavOpen(false);
            });

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    setNavOpen(false);
                }
            });

            window.addEventListener("resize", () => {
                if (!isMobile()) setNavOpen(false);
            });
        }
    }

    function setupAuthState() {
        const current = store.getCurrentUser();
        qsa("[data-auth-area]").forEach((node) => {
            if (current) {
                node.innerHTML = `
                    <a class="button button-soft" href="account.html">${escapeHtml(current.name)}</a>
                    <button class="button button-ghost" type="button" data-logout-button>退出登录</button>
                `;
                return;
            }

            node.innerHTML = page === "auth"
                ? ""
                : `<a class="button button-soft" href="login.html">登录 / 注册</a>`;
        });

        qsa("[data-logout-button]").forEach((button) => {
            button.onclick = function () {
                store.logout();
                window.location.href = "index.html";
            };
        });
    }

    function fillOverviewStats() {
        const stats = store.getOverview();
        qsa("[data-api-field]").forEach((node) => {
            const key = node.dataset.apiField;
            if (stats[key] !== undefined) {
                node.textContent = stats[key];
                node.setAttribute("data-countup", String(stats[key]).replace(/[^\d]/g, ""));
            }
        });
    }

    function setupQuickSearch() {
        const input = qs("#quick-search");
        const result = qs("#quick-search-result");
        if (!input || !result) return;

        input.addEventListener("input", () => {
            const keyword = input.value.trim();
            if (!keyword) {
                result.innerHTML = "";
                return;
            }

            const matches = data.quickLinks
                .filter((item) => item.label.includes(keyword))
                .slice(0, 5);

            result.innerHTML = matches.length
                ? matches.map((item) => `<a class="button button-soft" href="${item.href}">${item.label}</a>`).join("")
                : `<span class="status-note">没有找到完全匹配的页面，可以试试“社区”“课程”“成果”。</span>`;
        });
    }

    function showToast(message, tone) {
        let host = qs(".toast-host");
        if (!host) {
            host = document.createElement("div");
            host.className = "toast-host";
            document.body.appendChild(host);
        }

        const toast = document.createElement("div");
        toast.className = `toast-item ${tone ? `is-${tone}` : ""}`;
        toast.textContent = message;
        host.appendChild(toast);

        window.setTimeout(() => {
            toast.classList.add("is-leaving");
            window.setTimeout(() => toast.remove(), 260);
        }, 2200);
    }

    function setupGlobalTools() {
        if (!qs(".page-progress")) {
            document.body.insertAdjacentHTML("beforeend", `
                <div class="page-progress"><span></span></div>
                <button class="backtop-button" type="button" aria-label="返回顶部">↑</button>
                <button class="command-launch" type="button" aria-label="快捷导航">⌘</button>
                <div class="command-overlay" hidden>
                    <div class="command-panel">
                        <div class="command-head">
                            <strong>快捷导航</strong>
                            <button type="button" data-command-close>关闭</button>
                        </div>
                        <input id="command-search" type="text" placeholder="搜索页面、功能或入口">
                        <div class="command-list"></div>
                    </div>
                </div>
            `);
        }

        const progress = qs(".page-progress span");
        const backTop = qs(".backtop-button");
        const launch = qs(".command-launch");
        const overlay = qs(".command-overlay");
        const list = qs(".command-list");
        const search = qs("#command-search");

        function updateScrollProgress() {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const percent = total > 0 ? (window.scrollY / total) * 100 : 0;
            if (progress) progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
            if (backTop) backTop.classList.toggle("is-visible", window.scrollY > 260);
        }

        function renderCommandList(keyword) {
            if (!list) return;
            const value = String(keyword || "").trim().toLowerCase();
            const items = data.quickLinks.filter((item) => {
                if (!value) return true;
                return item.label.toLowerCase().includes(value) || item.href.toLowerCase().includes(value);
            });

            list.innerHTML = items.length
                ? items.map((item) => `
                    <a class="command-link" href="${item.href}">
                        <strong>${item.label}</strong>
                        <span>${item.href}</span>
                    </a>
                `).join("")
                : `<div class="empty-state">没有找到匹配入口，可以换个关键词试试。</div>`;
        }

        function openPalette() {
            if (!overlay) return;
            overlay.hidden = false;
            document.body.classList.add("is-command-open");
            renderCommandList("");
            if (search) {
                search.value = "";
                window.setTimeout(() => search.focus(), 30);
            }
        }

        function closePalette() {
            if (!overlay) return;
            overlay.hidden = true;
            document.body.classList.remove("is-command-open");
        }

        window.addEventListener("scroll", updateScrollProgress, { passive: true });
        updateScrollProgress();

        if (backTop) {
            backTop.onclick = function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            };
        }

        if (launch) launch.onclick = openPalette;
        if (overlay) {
            overlay.onclick = function (event) {
                if (event.target === overlay || event.target.closest("[data-command-close]")) {
                    closePalette();
                }
            };
        }

        if (search) {
            search.oninput = function () {
                renderCommandList(search.value);
            };
        }

        if (list) {
            list.addEventListener("click", (event) => {
                if (event.target.closest(".command-link")) {
                    closePalette();
                }
            });
        }

        document.addEventListener("keydown", (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (overlay && !overlay.hidden) {
                    closePalette();
                } else {
                    openPalette();
                }
            }

            if (event.key === "Escape" && overlay && !overlay.hidden) {
                closePalette();
            }
        });
    }

    function setupMotionEnhancements() {
        if (!revealObserver) {
            revealObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.14 });
        }

        qsa(".card, .panel-card, .form-card, .table-card, .quote-card, .hero-panel, .metric-card, .post-card").forEach((node, index) => {
            if (node.dataset.motionReady) return;
            node.dataset.motionReady = "true";
            node.classList.add("reveal-item");
            node.style.setProperty("--reveal-delay", `${Math.min(index * 0.04, 0.28)}s`);
            revealObserver.observe(node);
        });

        if (!counterObserver) {
            counterObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const node = entry.target;
                    const finalValue = Number(node.dataset.countup || 0);
                    const suffix = node.dataset.countSuffix || "";
                    const duration = 900;
                    const start = performance.now();

                    function step(now) {
                        const progress = Math.min(1, (now - start) / duration);
                        const value = Math.round(finalValue * (1 - Math.pow(1 - progress, 3)));
                        node.textContent = `${value}${suffix}`;
                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        }
                    }

                    window.requestAnimationFrame(step);
                    counterObserver.unobserve(node);
                });
            }, { threshold: 0.55 });
        }

        qsa("[data-countup]").forEach((node) => {
            if (node.dataset.counterReady) return;
            node.dataset.counterReady = "true";
            counterObserver.observe(node);
        });
    }

    function ensureFeatureSection(id, label, title, description) {
        const pageRoot = qs(".page");
        if (!pageRoot) return null;

        let section = qs(`#${id}`);
        if (!section) {
            pageRoot.insertAdjacentHTML("beforeend", `
                <section id="${id}" class="section feature-section">
                    <div class="section-header">
                        <div>
                            <span class="section-label">${label}</span>
                            <h2>${title}</h2>
                            <p>${description}</p>
                        </div>
                    </div>
                    <div class="feature-body"></div>
                </section>
            `);
            section = qs(`#${id}`);
        }

        return section ? section.querySelector(".feature-body") : null;
    }

    function activityTypeLabel(type) {
        return {
            post: "社区交流",
            submission: "项目报名",
            booking: "空间预约"
        }[type] || "平台动态";
    }

    function renderHome() {
        const dimensionActions = [
            [
                { label: "查看学科全景", href: "detail.html" },
                { label: "浏览课程图谱", href: "rent.html", variant: "button-soft" }
            ],
            [
                { label: "进入创新社区", href: "community.html" },
                { label: "查看成果荣誉", href: "badge.html", variant: "button-soft" }
            ],
            [
                { label: "查看实验空间", href: "spots.html" },
                { label: "进入协同育人", href: "partner.html", variant: "button-soft" }
            ],
            [
                { label: "登录 / 注册", href: "login.html" },
                { label: "查看数据驾驶舱", href: "admin.html", variant: "button-soft" }
            ]
        ];

        render(
            "#home-dimensions",
            data.home.dimensions.map((item, index) => `
                <article class="card is-interactive">
                    <div class="card-topline">${item.tag}</div>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    <ul class="tag-list">${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>
                    ${renderActions(dimensionActions[index] || [])}
                </article>
            `).join("")
        );

        renderTimeline("#home-news", data.home.news);

        const milestoneActions = [
            [{ label: "查看全部页面", href: "detail.html" }],
            [{ label: "GitHub 部署说明", href: "DEPLOY_GITHUB_PAGES.md" }],
            [{ label: "进入账户系统", href: "login.html" }],
            [{ label: "品牌修改说明", href: "品牌信息修改说明.md" }]
        ];

        render(
            "#home-milestones",
            data.home.milestones.map((item, index) => `
                <article class="card is-interactive">
                    <div class="bento-number">${item.number}</div>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    ${renderActions(milestoneActions[index] || [])}
                </article>
            `).join("")
        );
    }

    function renderDetail() {
        const directionAnchors = ["direction-ai", "direction-web", "direction-software", "direction-security"];
        const actions = [
            [{ label: "查看 AI 实验室", href: "spots.html#lab-ai" }],
            [{ label: "查看工程课程路径", href: "rent.html#track-engineering" }],
            [{ label: "查看协同开发机制", href: "partner.html#partner-stages" }],
            [{ label: "查看安全实验场景", href: "spots.html#lab-security" }]
        ];

        render(
            "#detail-directions",
            data.detail.directions.map((item, index) => `
                <article id="${directionAnchors[index]}" class="card is-interactive">
                    <div class="card-topline">${item.tag}</div>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    <ul class="tag-list">${item.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>
                    ${renderActions(actions[index] || [])}
                </article>
            `).join("")
        );

        renderTimeline("#detail-roadmap", data.detail.roadmap);
        render("#detail-culture", data.detail.culture.map((item) => `<li>${item}</li>`).join(""));
    }

    function renderSpots() {
        const labAnchors = ["lab-ai", "lab-innovation", "lab-algorithm", "lab-security"];
        const labActions = [
            [{ label: "查看 AI 方向详情", href: "detail.html#direction-ai" }],
            [{ label: "查看工程课程路径", href: "rent.html#track-engineering" }],
            [{ label: "查看算法成长路线", href: "detail.html#detail-roadmap" }],
            [{ label: "查看安全方向详情", href: "detail.html#direction-security" }]
        ];

        render(
            "#spots-labs",
            data.spots.labs.map((item, index) => `
                <article id="${labAnchors[index]}" class="card is-interactive">
                    <div class="card-topline">${item.tag}</div>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    <ul class="meta-list">${item.meta.map((meta) => `<li>${meta}</li>`).join("")}</ul>
                    ${renderActions(labActions[index] || [])}
                </article>
            `).join("")
        );

        renderTableBody("#spots-schedule-body", data.spots.schedule);

        const valueActions = [
            [{ label: "前往登录注册", href: "login.html" }],
            [{ label: "查看协同育人", href: "partner.html" }],
            [{ label: "查看成果荣誉", href: "badge.html" }]
        ];

        render(
            "#spots-values",
            data.spots.values.map((item, index) => `
                <article class="card is-interactive">
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    ${renderActions(valueActions[index] || [])}
                </article>
            `).join("")
        );
    }

    function renderCourses() {
        const trackAnchors = ["track-foundation", "track-engineering", "track-frontier"];
        const trackActions = [
            [{ label: "查看方向全景", href: "detail.html#detail-directions" }],
            [{ label: "查看创新实验室", href: "spots.html#lab-innovation" }],
            [{ label: "查看项目驾驶舱", href: "admin.html#dashboard-stats" }]
        ];

        render(
            "#courses-tracks",
            data.courses.tracks.map((item, index) => `
                <article id="${trackAnchors[index]}" class="card is-interactive">
                    <div class="card-topline">${item.tag}</div>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    <ul class="tag-list">${item.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>
                    ${renderActions(trackActions[index] || [])}
                </article>
            `).join("")
        );

        renderTimeline("#courses-semesters", data.courses.semesters);
        render("#courses-projects", data.courses.projects.map((item) => `<li>${item}</li>`).join(""));
    }

    function renderPartner() {
        const actions = [
            [{ label: "查看社区协作", href: "community.html" }],
            [{ label: "浏览课程图谱", href: "rent.html" }],
            [{ label: "查看成果荣誉", href: "badge.html" }]
        ];

        render(
            "#partner-cards",
            data.partner.partners.map((item, index) => `
                <article class="card is-interactive">
                    <div class="card-topline">${item.tag}</div>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    ${renderActions(actions[index] || [])}
                </article>
            `).join("")
        );

        renderTimeline("#partner-stages", data.partner.stages);
        renderTableBody("#partner-map-body", data.partner.map);
    }

    function renderBadge() {
        const honorActions = [
            [{ label: "查看智慧服务", href: "admin-login.html" }],
            [{ label: "进入创新社区", href: "community.html" }],
            [{ label: "打开账户中心", href: "account.html" }]
        ];

        render(
            "#badge-honors",
            data.badge.honors.map((item, index) => `
                <article class="card is-interactive">
                    <div class="card-topline">${item.tag}</div>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    ${renderActions(honorActions[index] || [])}
                </article>
            `).join("")
        );

        const storyActions = [
            [{ label: "查看学科全景", href: "detail.html" }],
            [{ label: "进入数据驾驶舱", href: "admin.html" }],
            [{ label: "GitHub 部署说明", href: "DEPLOY_GITHUB_PAGES.md" }]
        ];

        render(
            "#badge-stories",
            data.badge.stories.map((item, index) => `
                <article class="card is-interactive">
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    ${renderActions(storyActions[index] || [])}
                </article>
            `).join("")
        );

        render(
            "#badge-metrics",
            data.badge.metrics.map((item) => `
                <article class="card">
                    <div class="bento-number" data-countup="${item.value}">${item.value}</div>
                    <h3>${item.label}</h3>
                    <p>用可视化方式呈现荣誉、活动和共创成果，让页面更有比赛展示质感。</p>
                </article>
            `).join("")
        );
    }

    function renderCommunityBasics() {
        const benefitActions = [
            [{ label: "查看学科方向", href: "detail.html" }],
            [{ label: "浏览课程图谱", href: "rent.html" }],
            [{ label: "查看成果页面", href: "badge.html" }]
        ];

        render(
            "#community-benefits",
            data.community.benefits.map((item, index) => `
                <article class="card is-interactive">
                    <div class="card-topline">${item.tag}</div>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    ${renderActions(benefitActions[index] || [])}
                </article>
            `).join("")
        );

        const faqActions = [
            [{ label: "立即报名", href: "#join-form" }],
            [{ label: "查看智慧服务", href: "admin-login.html" }],
            [{ label: "打开驾驶舱", href: "admin.html" }]
        ];

        render(
            "#community-faq",
            data.community.faq.map((item, index) => `
                <article class="card is-interactive">
                    <h3>${item.q}</h3>
                    <p>${item.a}</p>
                    ${renderActions(faqActions[index] || [])}
                </article>
            `).join("")
        );

        const current = store.getCurrentUser();
        if (!current) return;

        const fields = {
            "#join-userName": current.name,
            "#join-major": current.major,
            "#join-contact": current.email,
            "#join-direction": current.direction
        };

        Object.keys(fields).forEach((selector) => {
            const node = qs(selector);
            if (node && fields[selector]) node.value = fields[selector];
        });
    }

    function renderCommunityStats() {
        const stats = store.getCommunityStats();
        const currentTagNode = qs("#community-active-tag");

        render(
            "#community-stats",
            [
                { label: "交流帖子", value: stats.totalPosts, text: "社区已经形成稳定内容流" },
                { label: "累计点赞", value: stats.totalLikes, text: "内容热度与互动参与" },
                { label: "累计收藏", value: stats.totalStars, text: "优质经验持续沉淀" }
            ].map((item) => `
                <article class="metric-card">
                    <strong data-countup="${item.value}">${item.value}</strong>
                    <span>${item.label}</span>
                    <small>${item.text}</small>
                </article>
            `).join("")
        );

        render(
            "#community-tags",
            stats.hotTags.length
                ? stats.hotTags.map((tag) => `
                    <button
                        class="chip-button ${activeCommunityTag === tag.name ? "is-active" : ""}"
                        type="button"
                        data-community-tag="${escapeHtml(tag.name)}"
                    >
                        #${tag.name}
                        <span>${tag.count}</span>
                    </button>
                `).join("")
                : `<div class="empty-state">还没有热门标签，发布第一条帖子来点亮社区吧。</div>`
        );

        if (currentTagNode) {
            currentTagNode.innerHTML = activeCommunityTag
                ? `<button class="chip-button is-active" type="button" data-community-tag-clear>当前标签：#${escapeHtml(activeCommunityTag)} · 清除筛选</button>`
                : "";
        }
    }

    function getFilteredPosts() {
        const search = String(qs("#post-search")?.value || "").trim().toLowerCase();
        const direction = String(qs("#post-filter-direction")?.value || "").trim();
        const sortMode = String(qs("#post-sort-mode")?.value || "latest");

        let posts = store.getPosts().slice();

        if (search) {
            posts = posts.filter((post) => {
                const textBag = [
                    post.title,
                    post.content,
                    post.author,
                    (post.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return textBag.includes(search);
            });
        }

        if (direction) {
            posts = posts.filter((post) => post.direction === direction);
        }

        if (activeCommunityTag) {
            posts = posts.filter((post) => (post.tags || []).includes(activeCommunityTag));
        }

        posts.sort((a, b) => {
            if (sortMode === "hot") {
                return ((b.likes || 0) + (b.comments || 0)) - ((a.likes || 0) + (a.comments || 0));
            }
            if (sortMode === "star") {
                return (b.stars || 0) - (a.stars || 0);
            }
            return dateValue(b.createdAt) - dateValue(a.createdAt);
        });

        return posts;
    }

    function renderCommunityFeed() {
        const current = store.getCurrentUser();
        const actor = current ? current.id : "guest";
        const posts = getFilteredPosts();

        render(
            "#community-feed",
            posts.length
                ? posts.map((post) => {
                    const liked = Array.isArray(post.likedBy) && post.likedBy.includes(actor);
                    const starred = Array.isArray(post.starredBy) && post.starredBy.includes(actor);
                    return `
                        <article class="post-card">
                            <div class="post-topline">
                                <span class="card-topline">${escapeHtml(post.direction)}</span>
                                <span>${escapeHtml(formatRelativeTime(post.createdAt))}</span>
                            </div>
                            <h3>${escapeHtml(post.title)}</h3>
                            <p>${escapeHtml(post.content)}</p>
                            <div class="post-tags">
                                ${(post.tags || []).map((tag) => `<button class="chip-button" type="button" data-community-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`).join("")}
                            </div>
                            <div class="post-meta">
                                <strong>${escapeHtml(post.author)}</strong>
                                <span>${escapeHtml(post.createdAt)}</span>
                            </div>
                            <div class="post-actions">
                                <button class="post-action ${liked ? "is-active" : ""}" type="button" data-post-like="${post.id}">
                                    点赞 <span>${post.likes || 0}</span>
                                </button>
                                <button class="post-action ${starred ? "is-active" : ""}" type="button" data-post-star="${post.id}">
                                    收藏 <span>${post.stars || 0}</span>
                                </button>
                                <span class="post-action is-static">讨论 ${post.comments || 0}</span>
                            </div>
                        </article>
                    `;
                }).join("")
                : `<div class="empty-state">当前筛选条件下还没有帖子，换个关键词试试，或者发布一条新的交流内容。</div>`
        );
    }

    function setupCommunityBoard() {
        const shell = qs(".community-shell");
        const postForm = qs("#post-form");
        const postStatus = qs("#post-status");
        if (!shell) return;

        function refreshCommunityBoard() {
            renderCommunityStats();
            renderCommunityFeed();
            setupMotionEnhancements();
        }

        refreshCommunityBoard();

        shell.addEventListener("click", (event) => {
            const tagButton = event.target.closest("[data-community-tag]");
            if (tagButton) {
                activeCommunityTag = tagButton.dataset.communityTag || "";
                refreshCommunityBoard();
                return;
            }

            const clearButton = event.target.closest("[data-community-tag-clear]");
            if (clearButton) {
                activeCommunityTag = "";
                refreshCommunityBoard();
                return;
            }

            const likeButton = event.target.closest("[data-post-like]");
            if (likeButton) {
                store.togglePostLike(likeButton.dataset.postLike);
                refreshCommunityBoard();
                return;
            }

            const starButton = event.target.closest("[data-post-star]");
            if (starButton) {
                store.togglePostStar(starButton.dataset.postStar);
                refreshCommunityBoard();
            }
        });

        qsa("#post-search, #post-filter-direction, #post-sort-mode").forEach((node) => {
            node.addEventListener("input", refreshCommunityBoard);
            node.addEventListener("change", refreshCommunityBoard);
        });

        if (postForm && postStatus) {
            postForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const current = store.getCurrentUser();
                if (!current) {
                    postStatus.textContent = "请先登录后再发布交流帖子。";
                    postStatus.className = "status-note is-error";
                    return;
                }

                const payload = Object.fromEntries(new FormData(postForm).entries());
                if (!payload.title || !payload.direction || !payload.content) {
                    postStatus.textContent = "请完整填写标题、方向和正文内容。";
                    postStatus.className = "status-note is-error";
                    return;
                }

                if (String(payload.content).trim().length < 12) {
                    postStatus.textContent = "正文内容至少写 12 个字，这样帖子会更有交流价值。";
                    postStatus.className = "status-note is-error";
                    return;
                }

                store.addPost(payload);
                postStatus.textContent = "发布成功，你的帖子已经进入交流广场。";
                postStatus.className = "status-note is-success";
                postForm.reset();
                activeCommunityTag = "";
                refreshCommunityBoard();
                fillOverviewStats();
            });
        }
    }

    function renderService() {
        const moduleActions = [
            [{ label: "查看课程图谱", href: "rent.html" }],
            [{ label: "阅读项目说明", href: "README.md" }],
            [{ label: "前往账户系统", href: "login.html" }]
        ];

        render(
            "#service-modules",
            data.service.modules.map((item, index) => `
                <article class="card is-interactive">
                    <div class="card-topline">${item.tag}</div>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    ${renderActions(moduleActions[index] || [])}
                </article>
            `).join("")
        );

        const resourceActions = [
            [{ label: "打开项目介绍", href: "项目介绍文档.md" }],
            [{ label: "查看首页", href: "index.html" }],
            [{ label: "GitHub 部署", href: "DEPLOY_GITHUB_PAGES.md" }],
            [{ label: "查看驾驶舱", href: "admin.html" }],
            [{ label: "进入成果荣誉", href: "badge.html" }],
            [{ label: "品牌替换说明", href: "品牌信息修改说明.md" }]
        ];

        render(
            "#service-resources",
            data.service.resources.map((item, index) => `
                <article class="card resource-card is-interactive">
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    ${renderActions(resourceActions[index] || [])}
                </article>
            `).join("")
        );

        renderTableBody("#service-schedule-body", data.service.schedule);
    }

    function setupCommunityForm() {
        const form = qs("#join-form");
        const status = qs("#join-status");
        if (!form || !status) return;

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const payload = Object.fromEntries(new FormData(form).entries());

            if (!payload.userName || !payload.major || !payload.grade || !payload.direction || !payload.contact || !payload.idea) {
                status.textContent = "请完整填写报名信息。";
                status.className = "status-note is-error";
                return;
            }

            if (String(payload.idea).trim().length < 8) {
                status.textContent = "项目想法至少填写 8 个字。";
                status.className = "status-note is-error";
                return;
            }

            store.submitJoin(payload);
            status.textContent = "提交成功，你的创意已经进入社区项目池。";
            status.className = "status-note is-success";
            form.reset();
            renderCommunityBasics();
            renderRecentSubmissions();
            fillOverviewStats();
            setupMotionEnhancements();
        });
    }

    function renderRecentSubmissions() {
        const submissions = store.getSubmissions().slice(0, 4);
        render(
            "#recent-submissions",
            submissions.map((item) => `
                <article class="card">
                    <div class="card-topline">${escapeHtml(item.direction)}</div>
                    <h3>${escapeHtml(item.userName)}</h3>
                    <p>${escapeHtml(item.idea)}</p>
                    <ul class="meta-list">
                        <li><strong>专业</strong>${escapeHtml(item.major)}</li>
                        <li><strong>年级</strong>${escapeHtml(item.grade)}</li>
                        <li><strong>时间</strong>${escapeHtml(item.createdAt)}</li>
                    </ul>
                </article>
            `).join("")
        );
    }

    function setupAuthPage() {
        const loginForm = qs("#login-form");
        const registerForm = qs("#register-form");
        const loginStatus = qs("#login-status");
        const registerStatus = qs("#register-status");

        if (loginForm && loginStatus) {
            loginForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const payload = Object.fromEntries(new FormData(loginForm).entries());
                try {
                    store.login(payload);
                    loginStatus.textContent = "登录成功，正在进入账户中心。";
                    loginStatus.className = "status-note is-success";
                    const params = new URLSearchParams(window.location.search);
                    const redirect = params.get("redirect") || "account.html";
                    setTimeout(() => {
                        window.location.href = redirect;
                    }, 450);
                } catch (error) {
                    loginStatus.textContent = error.message;
                    loginStatus.className = "status-note is-error";
                }
            });
        }

        if (registerForm && registerStatus) {
            registerForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const payload = Object.fromEntries(new FormData(registerForm).entries());
                if (payload.password !== payload.confirmPassword) {
                    registerStatus.textContent = "两次输入的密码不一致。";
                    registerStatus.className = "status-note is-error";
                    return;
                }
                if (String(payload.password || "").length < 6) {
                    registerStatus.textContent = "密码至少需要 6 位。";
                    registerStatus.className = "status-note is-error";
                    return;
                }
                try {
                    store.register(payload);
                    registerStatus.textContent = "注册成功，正在跳转到账户中心。";
                    registerStatus.className = "status-note is-success";
                    setTimeout(() => {
                        window.location.href = "account.html";
                    }, 450);
                } catch (error) {
                    registerStatus.textContent = error.message;
                    registerStatus.className = "status-note is-error";
                }
            });
        }
    }

    function ensureLogin() {
        const current = store.getCurrentUser();
        if (current) return current;
        window.location.href = "login.html?redirect=account.html";
        return null;
    }

    function renderAccount() {
        const current = ensureLogin();
        if (!current) return;

        const submissions = store.getMySubmissions();
        const posts = store.getMyPosts();

        render(
            "#account-overview",
            [
                { value: submissions.length, label: "我的报名", text: "已经提交到创新社区的项目报名记录" },
                { value: posts.length, label: "我的帖子", text: "我在交流广场发布的内容数量" },
                { value: current.direction || "未选", label: "当前方向", text: "用于匹配项目与社区协作内容" }
            ].map((item) => `
                <article class="card">
                    <div class="bento-number" ${typeof item.value === "number" ? `data-countup="${item.value}"` : ""}>${escapeHtml(item.value)}</div>
                    <h3>${item.label}</h3>
                    <p>${item.text}</p>
                </article>
            `).join("")
        );

        render(
            "#account-profile",
            `
                <ul class="meta-list">
                    <li><strong>姓名</strong>${escapeHtml(current.name)}</li>
                    <li><strong>学校</strong>${escapeHtml(data.campus.schoolName)}</li>
                    <li><strong>学院</strong>${escapeHtml(current.college)}</li>
                    <li><strong>专业</strong>${escapeHtml(current.major)}</li>
                    <li><strong>方向</strong>${escapeHtml(current.direction)}</li>
                    <li><strong>邮箱</strong>${escapeHtml(current.email)}</li>
                    <li><strong>简介</strong>${escapeHtml(current.bio || "这个同学还没有填写个人简介。")}</li>
                </ul>
            `
        );

        render(
            "#account-submissions",
            submissions.length
                ? submissions.map((item) => `
                    <article class="card">
                        <div class="card-topline">${escapeHtml(item.direction)}</div>
                        <h3>${escapeHtml(item.idea)}</h3>
                        <p>提交时间：${escapeHtml(item.createdAt)}</p>
                    </article>
                `).join("")
                : `<div class="empty-state">你还没有提交社区报名，可以去创新社区体验完整交互。</div>`
        );

        render(
            "#account-posts",
            posts.length
                ? posts.map((item) => `
                    <article class="card">
                        <div class="card-topline">${escapeHtml(item.direction)}</div>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.content)}</p>
                        <ul class="meta-list">
                            <li><strong>发布时间</strong>${escapeHtml(item.createdAt)}</li>
                            <li><strong>点赞</strong>${item.likes || 0}</li>
                            <li><strong>收藏</strong>${item.stars || 0}</li>
                        </ul>
                    </article>
                `).join("")
                : `<div class="empty-state">你还没有发布交流帖子，去社区发一条内容会更像完整产品体验。</div>`
        );

        const form = qs("#account-form");
        const status = qs("#account-status");
        if (form && status) {
            form.elements.namedItem("name").value = current.name;
            form.elements.namedItem("college").value = current.college;
            form.elements.namedItem("major").value = current.major;
            form.elements.namedItem("direction").value = current.direction;
            form.elements.namedItem("bio").value = current.bio || "";

            form.onsubmit = function (event) {
                event.preventDefault();
                const payload = Object.fromEntries(new FormData(form).entries());
                try {
                    store.updateCurrentUserProfile(payload);
                    status.textContent = "账户资料已更新。";
                    status.className = "status-note is-success";
                    setupAuthState();
                    renderAccount();
                    mountAccountExtras();
                    setupMotionEnhancements();
                } catch (error) {
                    status.textContent = error.message;
                    status.className = "status-note is-error";
                }
            };
        }
    }

    function renderDashboard() {
        const result = store.getDashboard();

        render(
            "#dashboard-stats",
            result.summary.map((item) => `
                <article class="card">
                    <div class="bento-number" data-countup="${item.value}">${item.value}</div>
                    <h3>${item.label}</h3>
                    <p>${item.text}</p>
                </article>
            `).join("")
        );

        render(
            "#dashboard-directions",
            `
                <div class="direction-bars">
                    ${result.directionStats.map((item) => `
                        <div class="direction-row">
                            <strong>${item.name}</strong>
                            <div class="direction-track">
                                <div class="direction-fill" style="width:${item.percent}%"></div>
                            </div>
                            <span>${item.count}</span>
                        </div>
                    `).join("")}
                </div>
            `
        );

        render(
            "#dashboard-submissions",
            result.submissions.length
                ? result.submissions.map((item) => `
                    <tr>
                        <td>${escapeHtml(item.userName)}</td>
                        <td>${escapeHtml(item.major)}</td>
                        <td>${escapeHtml(item.direction)}</td>
                        <td>${escapeHtml(item.grade)}</td>
                        <td>${escapeHtml(item.idea)}</td>
                        <td>${escapeHtml(item.createdAt)}</td>
                    </tr>
                `).join("")
                : `<tr><td colspan="6" class="empty-state">暂时还没有报名记录。</td></tr>`
        );

        const refresh = qs("#dashboard-refresh");
        if (refresh) {
            refresh.onclick = function () {
                renderDashboard();
                mountDashboardReport();
                setupMotionEnhancements();
            };
        }
    }

    function mountHomeActivityBoard() {
        const body = ensureFeatureSection("home-activity-board", "Live Board", "近期平台动态", "把社区交流、项目报名和空间预约串成可视化动态，首页会更像一个真正持续运行的平台。");
        if (!body) return;

        const feed = store.getActivityFeed().slice(0, 6);
        body.innerHTML = `
            <div class="feature-grid">
                <div class="panel-card">
                    <h3>动态时间线</h3>
                    <div class="stack-list">
                        ${feed.map((item) => `
                            <article class="stack-item">
                                <div>
                                    <strong>${activityTypeLabel(item.type)}</strong>
                                    <p>${escapeHtml(item.title)}</p>
                                </div>
                                <span>${escapeHtml(item.meta)} · ${escapeHtml(formatRelativeTime(item.createdAt))}</span>
                            </article>
                        `).join("")}
                    </div>
                </div>
                <div class="panel-card">
                    <h3>答辩讲解提示</h3>
                    <ul class="bullet-list">
                        <li>先讲平台如何连接课程、社区、空间与成果</li>
                        <li>再讲用户如何从浏览、报名到沉淀个人记录</li>
                        <li>最后用驾驶舱说明作品的持续运营能力</li>
                    </ul>
                    <div class="chip-group" style="margin-top:16px;">
                        ${data.quickLinks.slice(0, 5).map((item) => `<a class="chip-button" href="${item.href}">${item.label}</a>`).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    function mountHomeChecklistBoard() {
        const body = ensureFeatureSection("home-checklist-board", "Checklist", "作品交付检查清单", "把关键交付项做成可勾选清单，提交前可以快速核验版本质量。");
        if (!body) return;

        const items = [
            { id: "theme_fit", title: "主题表达积极，契合计算机学科与校园文化" },
            { id: "pages_ready", title: "页面数量达标，信息架构完整清晰" },
            { id: "interaction_ready", title: "关键页面具备可演示的交互闭环" },
            { id: "mobile_ready", title: "移动端显示、导航与关闭逻辑通过检查" },
            { id: "docs_ready", title: "项目介绍、作品阐述与功能说明保持一致" }
        ];

        function renderChecklist() {
            const state = store.getCompetitionChecklist();
            const done = items.filter((item) => state[item.id]).length;
            const percent = Math.round((done / items.length) * 100);

            body.innerHTML = `
                <div class="feature-grid">
                    <div class="panel-card">
                        <h3>当前就绪度</h3>
                        <div class="progress-arc" style="--p:${(percent * 3.6).toFixed(2)}">
                            <strong>${percent}%</strong>
                            <span>${done}/${items.length} 项已完成</span>
                        </div>
                        <p class="status-note">建议在提交前一天把清单全部点亮，避免遗漏关键环节。</p>
                    </div>
                    <div class="panel-card">
                        <h3>检查项</h3>
                        <div class="checklist-list">
                            ${items.map((item) => `
                                <label class="check-item ${state[item.id] ? "is-done" : ""}">
                                    <input type="checkbox" data-check-item="${item.id}" ${state[item.id] ? "checked" : ""}>
                                    <span>${item.title}</span>
                                </label>
                            `).join("")}
                        </div>
                    </div>
                </div>
            `;
        }

        body.onchange = function (event) {
            const box = event.target.closest("[data-check-item]");
            if (!box) return;
            store.setChecklistItem(box.dataset.checkItem, box.checked);
            renderChecklist();
            showToast("清单状态已更新", "success");
        };

        renderChecklist();
    }

    function mountDetailMatcher() {
        const body = ensureFeatureSection("detail-match-board", "Path Finder", "方向匹配器", "通过兴趣点、表达偏好和成果目标，快速给出更适合你的学科方向，增强页面交互感。");
        if (!body) return;

        body.innerHTML = `
            <div class="feature-grid">
                <form class="form-card" id="detail-match-form">
                    <div class="field">
                        <label for="detail-interest">你最想解决什么问题</label>
                        <select id="detail-interest" name="interest">
                            <option value="visual">把复杂内容做得更好看、更易理解</option>
                            <option value="data">把校园数据变成决策参考</option>
                            <option value="system">做完整系统并推进团队协作</option>
                            <option value="security">提升校园网络与信息安全</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="detail-style">你更喜欢哪种工作节奏</label>
                        <select id="detail-style" name="style">
                            <option value="design">快速迭代、重视界面与体验</option>
                            <option value="logic">重视逻辑结构与流程设计</option>
                            <option value="research">喜欢分析、实验与持续优化</option>
                        </select>
                    </div>
                    <div class="submit-row">
                        <button class="button button-primary" type="submit">生成建议</button>
                    </div>
                </form>
                <div id="detail-match-result" class="panel-card"></div>
            </div>
        `;

        const form = qs("#detail-match-form");
        const result = qs("#detail-match-result");
        if (!form || !result) return;

        function renderMatch() {
            const payload = Object.fromEntries(new FormData(form).entries());
            let direction = "Web 全栈";
            let keywords = ["界面设计", "交互体验", "前端工程", "产品表达"];

            if (payload.interest === "data") {
                direction = "人工智能";
                keywords = ["数据分析", "模型应用", "可视化", "智能决策"];
            }
            if (payload.interest === "system" || payload.style === "logic") {
                direction = "软件工程";
                keywords = ["需求分析", "协同开发", "测试规范", "版本管理"];
            }
            if (payload.interest === "security") {
                direction = "网络安全";
                keywords = ["攻防演练", "系统运维", "风险意识", "专题展示"];
            }

            result.innerHTML = `
                <span class="section-label">Recommendation</span>
                <h3 style="margin-top:12px;">推荐方向：${direction}</h3>
                <p>这一路径更契合你当前的兴趣与表达方式，适合在比赛中形成既有专业深度、又能讲清校园价值的作品。</p>
                <ul class="tag-list">${keywords.map((item) => `<li>${item}</li>`).join("")}</ul>
            `;
        }

        form.onsubmit = function (event) {
            event.preventDefault();
            renderMatch();
            showToast("已生成方向建议", "success");
        };

        renderMatch();
    }

    function mountLabBookingPanel() {
        const body = ensureFeatureSection("spots-booking-board", "Booking", "空间预约与彩排安排", "把实验室空间从介绍页升级为可预约、可记录、可展示的场景，让页面更像真实平台。");
        if (!body) return;

        body.innerHTML = `
            <div class="feature-grid">
                <form class="form-card" id="lab-booking-form">
                    <div class="field">
                        <label for="booking-lab">空间选择</label>
                        <select id="booking-lab" name="lab">
                            <option>人工智能实验室</option>
                            <option>创新实验室（硬件实验室）</option>
                            <option>算法实验室</option>
                            <option>网络安全实验室</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="booking-slot">预约时段</label>
                        <select id="booking-slot" name="slot">
                            <option>周三 19:00-21:00</option>
                            <option>周四 14:00-16:00</option>
                            <option>周五 14:00-16:00</option>
                            <option>周六 09:00-11:00</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="booking-topic">用途说明</label>
                        <input id="booking-topic" name="topic" placeholder="如：比赛答辩彩排 / 项目联调" required>
                    </div>
                    <div class="field">
                        <label for="booking-contact">联系方式</label>
                        <input id="booking-contact" name="contact" placeholder="邮箱或手机号" required>
                    </div>
                    <div class="submit-row">
                        <button class="button button-primary" type="submit">提交预约</button>
                        <span id="booking-status" class="status-note">预约记录会同步到个人中心与平台快报。</span>
                    </div>
                </form>
                <div class="panel-card">
                    <h3>近期预约记录</h3>
                    <div id="lab-booking-list" class="stack-list"></div>
                </div>
            </div>
        `;

        const current = store.getCurrentUser();
        const contact = qs("#booking-contact");
        if (current && contact) contact.value = current.email || "";

        const list = qs("#lab-booking-list");
        const form = qs("#lab-booking-form");
        const status = qs("#booking-status");

        function renderBookings() {
            const items = store.getLabBookings().slice(0, 5);
            if (list) {
                list.innerHTML = items.map((item) => `
                    <article class="stack-item">
                        <div>
                            <strong>${escapeHtml(item.lab)}</strong>
                            <p>${escapeHtml(item.topic)}</p>
                        </div>
                        <span>${escapeHtml(item.slot)} · ${escapeHtml(item.status)}</span>
                    </article>
                `).join("");
            }
        }

        if (form && status) {
            form.onsubmit = function (event) {
                event.preventDefault();
                const payload = Object.fromEntries(new FormData(form).entries());
                if (!payload.topic || !payload.contact) {
                    status.textContent = "请完善预约说明和联系方式。";
                    status.className = "status-note is-error";
                    return;
                }
                store.bookLab(payload);
                status.textContent = "预约申请已提交，建议在答辩时展示这一真实使用场景。";
                status.className = "status-note is-success";
                renderBookings();
                showToast("预约已加入平台记录", "success");
                fillOverviewStats();
            };
        }

        renderBookings();
    }

    function mountCoursePlanner() {
        const body = ensureFeatureSection("courses-plan-board", "Planner", "个性化课程规划器", "根据目标、时间投入与偏好方向，生成更适合比赛展示的学习与项目推进建议。");
        if (!body) return;

        body.innerHTML = `
            <div class="feature-grid">
                <form class="form-card" id="course-plan-form">
                    <div class="field">
                        <label for="plan-target">当前目标</label>
                        <select id="plan-target" name="target">
                            <option>比赛答辩冲刺</option>
                            <option>校园服务作品落地</option>
                            <option>就业能力提升</option>
                            <option>科研探索准备</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="plan-hours">每周可投入时间</label>
                        <select id="plan-hours" name="weeklyHours">
                            <option>4-6 小时</option>
                            <option>8-10 小时</option>
                            <option>12 小时以上</option>
                        </select>
                    </div>
                    <div class="field">
                        <label for="plan-direction">偏好方向</label>
                        <select id="plan-direction" name="preferredDirection">
                            <option>Web 全栈</option>
                            <option>人工智能</option>
                            <option>软件工程</option>
                            <option>网络安全</option>
                        </select>
                    </div>
                    <div class="submit-row">
                        <button class="button button-primary" type="submit">生成并保存</button>
                    </div>
                </form>
                <div id="course-plan-result" class="panel-card"></div>
            </div>
        `;

        const form = qs("#course-plan-form");
        const result = qs("#course-plan-result");
        if (!form || !result) return;

        function buildPlan(payload) {
            const summary = `${payload.target}：建议以 ${payload.preferredDirection} 为主线，每周保持 ${payload.weeklyHours} 的稳定投入，优先形成可展示、可讲解、可复盘的阶段成果。`;
            const milestones = [
                "第 1 周：完成选题聚焦与信息架构梳理",
                "第 2 周：形成核心页面与视觉基调",
                "第 3 周：补齐关键交互与数据逻辑",
                "第 4 周：集中打磨答辩表达与成果展示"
            ];
            return { summary, milestones };
        }

        function renderPlan(plan) {
            if (!plan) {
                result.innerHTML = `<div class="empty-state">生成一份课程与项目推进方案后，这里会展示你的专属规划。</div>`;
                return;
            }
            result.innerHTML = `
                <span class="section-label">Plan Snapshot</span>
                <h3 style="margin-top:12px;">${escapeHtml(plan.preferredDirection)} · ${escapeHtml(plan.target)}</h3>
                <p>${escapeHtml(plan.summary)}</p>
                <ul class="bullet-list" style="margin-top:16px;">
                    ${(plan.milestones || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
                <p class="status-note" style="margin-top:16px;">最近更新：${escapeHtml(plan.updatedAt || "")}</p>
            `;
        }

        const currentPlan = store.getCoursePlan();
        renderPlan(currentPlan);

        form.onsubmit = function (event) {
            event.preventDefault();
            const payload = Object.fromEntries(new FormData(form).entries());
            const built = buildPlan(payload);
            const saved = store.saveCoursePlan({
                ...payload,
                summary: built.summary,
                milestones: built.milestones
            });
            renderPlan(saved);
            showToast("课程规划已保存", "success");
        };
    }

    function mountCourseTaskBoard() {
        const body = ensureFeatureSection("courses-task-board", "Task Board", "课程推进任务看板", "记录比赛周期内的学习与开发任务，形成可复盘的过程证据。");
        if (!body) return;

        body.innerHTML = `
            <div class="feature-grid">
                <form class="form-card" id="course-task-form">
                    <div class="field">
                        <label for="course-task-title">新增任务</label>
                        <input id="course-task-title" name="title" placeholder="例如：完善社区页面筛选逻辑" required>
                    </div>
                    <div class="submit-row">
                        <button class="button button-primary" type="submit">添加任务</button>
                        <span id="course-task-status" class="status-note">建议把任务拆小，每项都可在 1-2 小时内完成。</span>
                    </div>
                </form>
                <div class="panel-card">
                    <h3>任务列表</h3>
                    <div id="course-task-list" class="stack-list"></div>
                </div>
            </div>
        `;

        const form = qs("#course-task-form");
        const list = qs("#course-task-list");
        const status = qs("#course-task-status");

        function renderTasks() {
            const tasks = store.getCourseTasks();
            if (!list) return;
            list.innerHTML = tasks.length
                ? tasks.map((item) => `
                    <article class="stack-item ${item.done ? "is-done" : ""}">
                        <div>
                            <strong>${item.done ? "已完成" : "进行中"}</strong>
                            <p>${escapeHtml(item.title)}</p>
                        </div>
                        <div class="chip-group">
                            <button class="chip-button" type="button" data-task-toggle="${item.id}">
                                ${item.done ? "恢复为进行中" : "标记完成"}
                            </button>
                            <button class="chip-button" type="button" data-task-delete="${item.id}">删除</button>
                        </div>
                    </article>
                `).join("")
                : `<div class="empty-state">还没有任务，先添加一个今日目标吧。</div>`;
        }

        if (form && status) {
            form.onsubmit = function (event) {
                event.preventDefault();
                const payload = Object.fromEntries(new FormData(form).entries());
                if (!payload.title || !String(payload.title).trim()) {
                    status.textContent = "任务标题不能为空。";
                    status.className = "status-note is-error";
                    return;
                }
                store.addCourseTask(payload);
                status.textContent = "任务已加入看板。";
                status.className = "status-note is-success";
                form.reset();
                renderTasks();
                showToast("任务添加成功", "success");
            };
        }

        if (list) {
            list.onclick = function (event) {
                const toggle = event.target.closest("[data-task-toggle]");
                const del = event.target.closest("[data-task-delete]");
                if (toggle) {
                    store.toggleCourseTask(toggle.dataset.taskToggle);
                    renderTasks();
                    return;
                }
                if (del) {
                    store.removeCourseTask(del.dataset.taskDelete);
                    renderTasks();
                    showToast("任务已删除", "success");
                }
            };
        }

        renderTasks();
    }

    function mountPartnerRoleBoard() {
        const body = ensureFeatureSection("partner-role-board", "Role Board", "协作角色看板", "从不同角色视角解释平台如何协同运作，能显著增强答辩时的结构化表达。");
        if (!body) return;

        const roleMap = {
            student: { title: "学生成员", points: ["参与需求调研与原型设计", "负责页面实现、内容整理和答辩表达", "沉淀作品文档与复盘结论"] },
            mentor: { title: "导师 / 学长学姐", points: ["提供方向建议与阶段评审", "帮助团队识别风险和优化节奏", "补齐作品故事线与展示逻辑"] },
            club: { title: "社团 / 学院", points: ["提供真实校园场景与使用需求", "组织活动、展示和传播渠道", "推动作品沉淀为长期服务内容"] },
            enterprise: { title: "企业导师", points: ["补充行业视角和规范要求", "帮助判断落地价值与拓展空间", "提升作品专业度与竞争力"] }
        };

        body.innerHTML = `
            <div class="panel-card">
                <div class="segmented" id="partner-role-tabs">
                    <button class="is-active" type="button" data-role="student">学生成员</button>
                    <button type="button" data-role="mentor">导师 / 学长学姐</button>
                    <button type="button" data-role="club">社团 / 学院</button>
                    <button type="button" data-role="enterprise">企业导师</button>
                </div>
                <div id="partner-role-result" class="role-panel" style="margin-top:18px;"></div>
            </div>
        `;

        const result = qs("#partner-role-result");
        const tabs = qs("#partner-role-tabs");

        function renderRole(role) {
            const item = roleMap[role];
            if (!item || !result) return;
            result.innerHTML = `
                <h3>${item.title}</h3>
                <ul class="bullet-list">
                    ${item.points.map((point) => `<li>${point}</li>`).join("")}
                </ul>
            `;
        }

        if (tabs) {
            tabs.onclick = function (event) {
                const button = event.target.closest("[data-role]");
                if (!button) return;
                qsa("#partner-role-tabs button").forEach((node) => node.classList.toggle("is-active", node === button));
                renderRole(button.dataset.role);
            };
        }

        renderRole("student");
    }

    function mountBadgeJudgeBoard() {
        const body = ensureFeatureSection("badge-judge-board", "Judge View", "评审关注点模拟", "把评委最关心的维度转成可视化面板，更方便你对照作品亮点进行答辩。");
        if (!body) return;

        const views = {
            theme: ["主题积极向上，能体现计算机学科与校园文化的结合", "页面叙事不是空泛口号，而是落在课程、空间、社区、服务场景上"],
            experience: ["有真实交互链路，不是纯静态堆页面", "信息结构清晰，切换顺畅，移动端可用"],
            tech: ["前端实现完整，组件与数据逻辑统一", "界面表现力、动画与响应式处理较成熟"],
            value: ["作品具备持续运营潜力", "能支撑学院宣传、活动展示与学生实践成果传播"]
        };

        body.innerHTML = `
            <div class="panel-card">
                <div class="segmented" id="judge-tabs">
                    <button class="is-active" type="button" data-view="theme">主题契合</button>
                    <button type="button" data-view="experience">交互体验</button>
                    <button type="button" data-view="tech">技术实现</button>
                    <button type="button" data-view="value">校园价值</button>
                </div>
                <div id="judge-result" class="role-panel" style="margin-top:18px;"></div>
            </div>
        `;

        const result = qs("#judge-result");
        const tabs = qs("#judge-tabs");

        function renderView(view) {
            if (!result) return;
            result.innerHTML = `
                <ul class="bullet-list">
                    ${(views[view] || []).map((item) => `<li>${item}</li>`).join("")}
                </ul>
            `;
        }

        if (tabs) {
            tabs.onclick = function (event) {
                const button = event.target.closest("[data-view]");
                if (!button) return;
                qsa("#judge-tabs button").forEach((node) => node.classList.toggle("is-active", node === button));
                renderView(button.dataset.view);
            };
        }

        renderView("theme");
    }

    function mountServiceToolbox() {
        const body = ensureFeatureSection("service-toolbox-board", "Toolbox", "资源工具箱与收藏夹", "给服务页增加搜索与收藏能力，让资源中心更像可长期使用的实用模块。");
        if (!body) return;

        body.innerHTML = `
            <div class="panel-card">
                <div class="community-toolbar">
                    <input id="service-resource-search" type="text" placeholder="搜索答辩、视觉、部署、协作等资源">
                    <div class="chip-group" id="service-resource-tags">
                        <button class="chip-button is-active" type="button" data-resource-filter="">全部</button>
                        <button class="chip-button" type="button" data-resource-filter="答辩">答辩</button>
                        <button class="chip-button" type="button" data-resource-filter="部署">部署</button>
                        <button class="chip-button" type="button" data-resource-filter="视觉">视觉</button>
                    </div>
                </div>
                <div id="service-resource-toolbox" class="resource-grid" style="margin-top:18px;"></div>
            </div>
        `;

        let activeFilter = "";
        const search = qs("#service-resource-search");
        const list = qs("#service-resource-toolbox");
        const tagWrap = qs("#service-resource-tags");

        function renderResources() {
            if (!list) return;
            const keyword = String(search?.value || "").trim().toLowerCase();
            const favorites = store.getFavoriteResources();
            const items = data.service.resources.map((item, index) => ({ item, index })).filter(({ item }) => {
                const bag = `${item.title} ${item.text}`.toLowerCase();
                const hitKeyword = !keyword || bag.includes(keyword);
                const hitFilter = !activeFilter || bag.includes(activeFilter.toLowerCase());
                return hitKeyword && hitFilter;
            });

            list.innerHTML = items.map(({ item, index }) => {
                const id = `resource-${index + 1}`;
                const starred = favorites.includes(id);
                return `
                    <article class="card resource-card">
                        <div class="card-topline">Toolkit</div>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.text)}</p>
                        <div class="card-actions">
                            <button class="button ${starred ? "button-primary" : "button-ghost"}" type="button" data-resource-star="${id}">
                                ${starred ? "已收藏" : "收藏资源"}
                            </button>
                        </div>
                    </article>
                `;
            }).join("");
        }

        if (search) search.oninput = renderResources;
        if (tagWrap) {
            tagWrap.onclick = function (event) {
                const button = event.target.closest("[data-resource-filter]");
                if (!button) return;
                activeFilter = button.dataset.resourceFilter || "";
                qsa("#service-resource-tags .chip-button").forEach((node) => node.classList.toggle("is-active", node === button));
                renderResources();
            };
        }

        if (list) {
            list.onclick = function (event) {
                const button = event.target.closest("[data-resource-star]");
                if (!button) return;
                store.toggleFavoriteResource(button.dataset.resourceStar);
                renderResources();
                showToast("资源收藏状态已更新", "success");
            };
        }

        renderResources();
    }

    function mountDashboardReport() {
        const body = ensureFeatureSection("dashboard-report-board", "Report", "运行快报与导出摘要", "让数据驾驶舱除了展示，还能输出可复制、可讲解的答辩摘要内容。");
        if (!body) return;

        const dashboard = store.getDashboard();
        const activities = store.getActivityFeed().slice(0, 6);
        const summaryText = [
            `平台当前共展示 ${dashboard.summary[0]?.value || 0} 个页面模块。`,
            `社区累计沉淀 ${dashboard.submissions.length} 条报名记录和 ${store.getPosts().length} 条交流内容。`,
            `实验空间预约 ${store.getLabBookings().length} 条，服务资源收藏 ${store.getFavoriteResources().length} 条。`
        ].join("\n");

        body.innerHTML = `
            <div class="feature-grid">
                <div class="panel-card">
                    <h3>答辩快报</h3>
                    <pre class="report-box">${escapeHtml(summaryText)}</pre>
                    <div class="card-actions">
                        <button class="button button-primary" type="button" id="copy-dashboard-report">复制摘要</button>
                        <button class="button button-ghost" type="button" id="download-dashboard-report">下载文本</button>
                    </div>
                </div>
                <div class="panel-card">
                    <h3>最近六条平台动态</h3>
                    <div class="stack-list">
                        ${activities.map((item) => `
                            <article class="stack-item">
                                <div>
                                    <strong>${activityTypeLabel(item.type)}</strong>
                                    <p>${escapeHtml(item.title)}</p>
                                </div>
                                <span>${escapeHtml(formatRelativeTime(item.createdAt))}</span>
                            </article>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;

        const copyButton = qs("#copy-dashboard-report");
        const downloadButton = qs("#download-dashboard-report");
        if (copyButton) {
            copyButton.onclick = async function () {
                try {
                    await navigator.clipboard.writeText(summaryText);
                    showToast("已复制答辩摘要", "success");
                } catch (error) {
                    showToast("当前环境不支持直接复制", "error");
                }
            };
        }

        if (downloadButton) {
            downloadButton.onclick = function () {
                const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "competition-report.txt";
                link.click();
                URL.revokeObjectURL(link.href);
                showToast("已生成文本摘要", "success");
            };
        }
    }

    function mountAccountExtras() {
        const body = ensureFeatureSection("account-extra-board", "Personal Hub", "我的预约与学习规划", "把账户中心继续做深，体现平台对个人成长路径和使用记录的持续支持。");
        if (!body) return;

        const bookings = store.getMyLabBookings();
        const plan = store.getCoursePlan();
        const favorites = store.getFavoriteResources();

        body.innerHTML = `
            <div class="feature-grid">
                <div class="panel-card">
                    <h3>我的空间预约</h3>
                    <div class="stack-list">
                        ${bookings.length
                            ? bookings.slice(0, 4).map((item) => `
                                <article class="stack-item">
                                    <div>
                                        <strong>${escapeHtml(item.lab)}</strong>
                                        <p>${escapeHtml(item.topic)}</p>
                                    </div>
                                    <span>${escapeHtml(item.slot)}</span>
                                </article>
                            `).join("")
                            : `<div class="empty-state">还没有预约记录，可以去实验空间页提交一次预约。</div>`}
                    </div>
                </div>
                <div class="panel-card">
                    <h3>我的规划快照</h3>
                    ${plan
                        ? `
                            <p>${escapeHtml(plan.summary)}</p>
                            <ul class="bullet-list" style="margin-top:16px;">
                                ${(plan.milestones || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                            </ul>
                            <p class="status-note" style="margin-top:16px;">已收藏资源：${favorites.length} 项</p>
                        `
                        : `<div class="empty-state">你还没有保存课程规划，可以去课程图谱页生成一份专属方案。</div>`}
                </div>
            </div>
        `;
    }

    function enhanceAuthExperience() {
        const registerPassword = qs("#registerPassword");
        const confirmPassword = qs("#confirmPassword");
        const loginForm = qs("#login-form .submit-row");

        if (loginForm && !qs("#demo-login-fill")) {
            loginForm.insertAdjacentHTML("beforeend", `<button id="demo-login-fill" class="button button-ghost" type="button">填入演示账号</button>`);
            const demo = qs("#demo-login-fill");
            if (demo) {
                demo.onclick = function () {
                    const account = qs("#account");
                    const password = qs("#password");
                    if (account) account.value = "demo@campus.edu.cn";
                    if (password) password.value = "123456";
                    showToast("已填入演示账号", "success");
                };
            }
        }

        if (registerPassword && !qs("#password-meter")) {
            registerPassword.insertAdjacentHTML("afterend", `<div id="password-meter" class="strength-meter"><span></span><small>密码强度：待输入</small></div>`);
        }

        const meter = qs("#password-meter span");
        const meterText = qs("#password-meter small");
        function updateStrength() {
            if (!registerPassword || !meter || !meterText) return;
            const value = registerPassword.value;
            let score = 0;
            if (value.length >= 6) score += 1;
            if (/[A-Z]/.test(value) || /[a-z]/.test(value)) score += 1;
            if (/\d/.test(value)) score += 1;
            if (/[^A-Za-z0-9]/.test(value)) score += 1;
            meter.style.width = `${score * 25}%`;
            meterText.textContent = `密码强度：${["偏弱", "基础", "良好", "较强", "优秀"][score] || "待输入"}`;
        }

        if (registerPassword) registerPassword.addEventListener("input", updateStrength);
        if (confirmPassword) {
            confirmPassword.addEventListener("input", () => {
                if (!registerPassword || !confirmPassword.value) return;
                confirmPassword.classList.toggle("is-valid", confirmPassword.value === registerPassword.value);
            });
        }
        updateStrength();
    }

    document.addEventListener("DOMContentLoaded", function () {
        applyBranding();
        setupNav();
        setupAuthState();
        fillOverviewStats();
        setupQuickSearch();
        setupGlobalTools();

        if (page === "home") {
            renderHome();
            mountHomeActivityBoard();
        }
        if (page === "detail") {
            renderDetail();
            mountDetailMatcher();
        }
        if (page === "spots") {
            renderSpots();
            mountLabBookingPanel();
        }
        if (page === "courses") {
            renderCourses();
            mountCoursePlanner();
            mountCourseTaskBoard();
        }
        if (page === "partner") {
            renderPartner();
            mountPartnerRoleBoard();
        }
        if (page === "badge") {
            renderBadge();
            mountBadgeJudgeBoard();
        }
        if (page === "community") {
            renderCommunityBasics();
            setupCommunityBoard();
            setupCommunityForm();
            renderRecentSubmissions();
        }
        if (page === "service") {
            renderService();
            mountServiceToolbox();
        }
        if (page === "dashboard") {
            renderDashboard();
            mountDashboardReport();
        }
        if (page === "auth") {
            setupAuthPage();
            enhanceAuthExperience();
        }
        if (page === "account") {
            renderAccount();
            mountAccountExtras();
        }

        setupMotionEnhancements();
    });
})();
