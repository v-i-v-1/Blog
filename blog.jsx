import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

/* ============================================================
   FOOLSCAP — a full-stack blog
   ------------------------------------------------------------
   The block below is the "server": an in-memory database plus a
   REST-shaped API with token sessions, latency and real error
   responses. Swap `api` for fetch() calls to a live backend and
   nothing in the UI layer has to change.
   ============================================================ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const latency = () => 160 + Math.random() * 260;
const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

function hashPassword(pw) {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) | 0;
  return "scrypt$" + (h >>> 0).toString(16);
}

const now = Date.now();
const day = 86400000;

const db = {
  users: [
    {
      id: "usr_mara",
      name: "Mara Okonjo",
      handle: "mara",
      email: "mara@foolscap.dev",
      passwordHash: hashPassword("letmein!"),
      bio: "Typesetter turned systems person. Writing about the seams between craft and code.",
      ink: "blue",
      joined: now - day * 420,
    },
    {
      id: "usr_tev",
      name: "Tev Lindqvist",
      handle: "tev",
      email: "tev@foolscap.dev",
      passwordHash: hashPassword("letmein!"),
      bio: "Keeps a workshop in a garage and a notebook in every coat.",
      ink: "pink",
      joined: now - day * 260,
    },
    {
      id: "usr_ines",
      name: "Inés Ruiz",
      handle: "ines",
      email: "ines@foolscap.dev",
      passwordHash: hashPassword("letmein!"),
      bio: "Archivist. Interested in what gets kept and what gets thrown out.",
      ink: "green",
      joined: now - day * 95,
    },
  ],
  posts: [
    {
      id: "pst_1",
      authorId: "usr_mara",
      title: "The case for publishing before you're ready",
      subtitle: "Finished writing is a category error. Everything is a draft that stopped moving.",
      tags: ["writing", "craft"],
      status: "published",
      createdAt: now - day * 3,
      claps: ["usr_tev", "usr_ines"],
      body: `I kept a folder called **eventually** for six years. Ninety-one documents. Not one of them was ever finished, because "finished" was never a state any of them could reach — it was a permission slip I was waiting for someone else to sign.

Here is what I think now.

## Writing is a conversation you're having badly alone

A draft nobody reads is a draft with exactly one reader, and that reader already agrees with everything in it. You cannot find the hole in your own argument by staring harder at the sentence containing it. You find it when someone replies *wait, why?* and you discover you don't have an answer.

> The essay is not the thinking. The essay is the residue left over after the thinking.

## What "ready" actually means

When I interrogated my own hesitation, "not ready" always decomposed into one of three things:

- I'm worried this is obvious to everyone but me
- I'm worried this is wrong
- I'm worried this is *mine*, and someone will see me in it

The first is usually false. The second is fine — being wrong in public is the fastest correction mechanism ever invented. Only the third is real, and no amount of extra revision fixes it, because it isn't a problem with the draft.

## A practical rule

I now publish when a piece can survive one hostile question. Not every question. One. If a single skeptical reader can't immediately collapse it, it goes up, marked as provisional, and I let the replies do the rest of the work.

The folder is down to eleven documents. Most of the rest are here.`,
    },
    {
      id: "pst_2",
      authorId: "usr_tev",
      title: "Notes from rebuilding a workbench I already owned",
      subtitle: "Three weekends, one vice, and an argument with my father about flatness.",
      tags: ["making", "tools"],
      status: "published",
      createdAt: now - day * 8,
      claps: ["usr_mara"],
      body: `The old bench was fine. That is the whole problem with the old bench.

It was fine in the way that a chair with one short leg is fine once you've learned to sit still. I had been compensating for a twist in the top for so long that I'd stopped registering it as a defect and started registering it as *how wood behaves*.

## What flat costs

My father's position, delivered over the phone at some volume, is that flatness is a hobbyist's vanity. His bench has a dip in the middle you could lose a pencil in and he has built more furniture than I ever will.

He's not wrong about him. He's wrong about me. He compensates by feel, developed over forty years. I don't have forty years of feel. I have a reference surface, or I have nothing.

## The actual method

\`\`\`
1. Winding sticks, both ends, diagnose the twist
2. Traverse with a jack plane, across the grain, heavy
3. Diagonals with a jointer
4. Check. Swear. Repeat step 2.
5. Smoother, with the grain, last thing
\`\`\`

Step four took the second weekend entirely.

## Was it worth it

A dovetail I cut last Tuesday closed with no gap on the first fit. That has never happened to me before. I don't think I got better at dovetails in three weekends. I think I stopped fighting a surface that was lying to me.`,
    },
    {
      id: "pst_3",
      authorId: "usr_ines",
      title: "What archives throw away",
      subtitle: "The record is not what happened. It's what somebody decided was worth the shelf space.",
      tags: ["archives", "history"],
      status: "published",
      createdAt: now - day * 15,
      claps: ["usr_mara", "usr_tev"],
      body: `Every archive is a set of decisions about deletion, and almost none of those decisions are written down anywhere.

We have the mayor's correspondence from 1911 because it was filed. We do not have the note the clerk left on his desk, because notes on desks are not filed. The mayor's opinion about the tram extension survives. The clerk's opinion does not, and there were four hundred clerks and one mayor.

## Appraisal is the invisible authorship

In the trade we call it *appraisal*: deciding what enters the collection. It is presented as a technical function. It is the single most editorially powerful act in the profession, and it is performed by people whose names appear nowhere in the finding aid.

- Volume forces it — nobody can keep everything
- Format forces it — the fragile and the odd-sized lose
- Legibility forces it — an unlabelled photograph is a costly mystery

## The thing I want people to hold onto

When you read a historical claim built on archival evidence, the honest version of that claim always has a silent clause: *among the things that were kept*.

That's not a reason to distrust history. It's a reason to ask, every time, who did the keeping.`,
    },
    {
      id: "pst_4",
      authorId: "usr_mara",
      title: "Kerning is a moral position",
      subtitle: "Half-finished. Argue with me.",
      tags: ["typography"],
      status: "draft",
      createdAt: now - day * 1,
      claps: [],
      body: `Working theory: every decision about spacing is a decision about who gets read comfortably and who has to work for it.

Still need to figure out whether this is a real argument or just a thing I like saying.`,
    },
  ],
  comments: [
    {
      id: "cmt_1",
      postId: "pst_1",
      authorId: "usr_ines",
      createdAt: now - day * 2,
      body: "The 'survive one hostile question' rule is the useful part. I've been using 'would I defend this at a conference' and it sets the bar far too high.",
    },
    {
      id: "cmt_2",
      postId: "pst_1",
      authorId: "usr_tev",
      createdAt: now - day * 2 + 3600000,
      body: "Ninety-one documents is nothing. I have a shed.",
    },
    {
      id: "cmt_3",
      postId: "pst_3",
      authorId: "usr_mara",
      createdAt: now - day * 12,
      body: "The silent clause framing is going straight into how I read secondary sources. Thank you.",
    },
  ],
  sessions: new Map(),
};

class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

const publicUser = (u) =>
  u && { id: u.id, name: u.name, handle: u.handle, bio: u.bio, ink: u.ink, joined: u.joined };

function authed(token) {
  const userId = db.sessions.get(token);
  if (!userId) throw new ApiError(401, "Your session expired. Sign in again.");
  return db.users.find((u) => u.id === userId);
}

function decorate(post) {
  return {
    ...post,
    author: publicUser(db.users.find((u) => u.id === post.authorId)),
    commentCount: db.comments.filter((c) => c.postId === post.id).length,
    readingTime: Math.max(1, Math.round(post.body.split(/\s+/).length / 220)),
  };
}

const api = {
  // POST /auth/signup
  async signup({ name, handle, email, password }) {
    await sleep(latency());
    const fields = {};
    if (!name || name.trim().length < 2) fields.name = "Enter your name.";
    if (!handle || !/^[a-z0-9_]{3,16}$/.test(handle))
      fields.handle = "3–16 characters, lowercase letters, numbers or underscore.";
    if (!/^\S+@\S+\.\S+$/.test(email || "")) fields.email = "That doesn't look like an email address.";
    if (!password || password.length < 8) fields.password = "Use at least 8 characters.";
    if (db.users.some((u) => u.email === email)) fields.email = "That email already has an account.";
    if (db.users.some((u) => u.handle === handle)) fields.handle = "That handle is taken.";
    if (Object.keys(fields).length) throw new ApiError(422, "Check the highlighted fields.", fields);

    const inks = ["blue", "pink", "green"];
    const user = {
      id: uid("usr"),
      name: name.trim(),
      handle,
      email,
      passwordHash: hashPassword(password),
      bio: "",
      ink: inks[db.users.length % 3],
      joined: Date.now(),
    };
    db.users.push(user);
    const token = uid("tok");
    db.sessions.set(token, user.id);
    return { token, user: publicUser(user) };
  },

  // POST /auth/login
  async login({ email, password }) {
    await sleep(latency());
    const user = db.users.find((u) => u.email === (email || "").trim().toLowerCase());
    if (!user || user.passwordHash !== hashPassword(password))
      throw new ApiError(401, "That email and password don't match an account.");
    const token = uid("tok");
    db.sessions.set(token, user.id);
    return { token, user: publicUser(user) };
  },

  // POST /auth/logout
  async logout(token) {
    await sleep(120);
    db.sessions.delete(token);
    return { ok: true };
  },

  // PATCH /users/me
  async updateProfile(token, { bio }) {
    await sleep(latency());
    const me = authed(token);
    me.bio = bio.slice(0, 240);
    return publicUser(me);
  },

  // GET /posts
  async listPosts({ tag, q, authorHandle, token } = {}) {
    await sleep(latency());
    let viewer = null;
    try {
      viewer = token ? authed(token) : null;
    } catch {
      viewer = null;
    }
    let rows = db.posts.filter((p) => p.status === "published" || p.authorId === viewer?.id);
    if (tag) rows = rows.filter((p) => p.tags.includes(tag));
    if (authorHandle) {
      const a = db.users.find((u) => u.handle === authorHandle);
      rows = rows.filter((p) => p.authorId === a?.id);
    }
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter((p) =>
        (p.title + " " + p.subtitle + " " + p.body + " " + p.tags.join(" "))
          .toLowerCase()
          .includes(needle)
      );
    }
    return rows.sort((a, b) => b.createdAt - a.createdAt).map(decorate);
  },

  // GET /posts/:id
  async getPost(id, token) {
    await sleep(latency());
    const post = db.posts.find((p) => p.id === id);
    if (!post) throw new ApiError(404, "That post no longer exists.");
    let viewer = null;
    try {
      viewer = token ? authed(token) : null;
    } catch {
      viewer = null;
    }
    if (post.status === "draft" && post.authorId !== viewer?.id)
      throw new ApiError(403, "That post is still a draft.");
    return decorate(post);
  },

  // POST /posts  |  PATCH /posts/:id
  async savePost(token, draft) {
    await sleep(latency());
    const me = authed(token);
    const fields = {};
    if (!draft.title.trim()) fields.title = "A post needs a title.";
    if (draft.body.trim().length < 20) fields.body = "Write at least a couple of sentences.";
    if (Object.keys(fields).length) throw new ApiError(422, "Almost — fix these first.", fields);

    const tags = draft.tagText
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 4);

    if (draft.id) {
      const post = db.posts.find((p) => p.id === draft.id);
      if (!post) throw new ApiError(404, "That post no longer exists.");
      if (post.authorId !== me.id) throw new ApiError(403, "You can only edit your own posts.");
      Object.assign(post, {
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim(),
        body: draft.body,
        tags,
        status: draft.status,
      });
      return decorate(post);
    }
    const post = {
      id: uid("pst"),
      authorId: me.id,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      body: draft.body,
      tags,
      status: draft.status,
      createdAt: Date.now(),
      claps: [],
    };
    db.posts.push(post);
    return decorate(post);
  },

  // DELETE /posts/:id
  async deletePost(token, id) {
    await sleep(latency());
    const me = authed(token);
    const post = db.posts.find((p) => p.id === id);
    if (!post) throw new ApiError(404, "That post no longer exists.");
    if (post.authorId !== me.id) throw new ApiError(403, "You can only delete your own posts.");
    db.posts = db.posts.filter((p) => p.id !== id);
    db.comments = db.comments.filter((c) => c.postId !== id);
    return { ok: true };
  },

  // POST /posts/:id/claps
  async toggleClap(token, id) {
    await sleep(140);
    const me = authed(token);
    const post = db.posts.find((p) => p.id === id);
    if (!post) throw new ApiError(404, "That post no longer exists.");
    post.claps = post.claps.includes(me.id)
      ? post.claps.filter((x) => x !== me.id)
      : [...post.claps, me.id];
    return decorate(post);
  },

  // GET /posts/:id/comments
  async listComments(postId) {
    await sleep(latency());
    return db.comments
      .filter((c) => c.postId === postId)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((c) => ({ ...c, author: publicUser(db.users.find((u) => u.id === c.authorId)) }));
  },

  // POST /posts/:id/comments
  async addComment(token, postId, body) {
    await sleep(latency());
    const me = authed(token);
    if (!body.trim()) throw new ApiError(422, "Write something first.");
    const c = {
      id: uid("cmt"),
      postId,
      authorId: me.id,
      body: body.trim(),
      createdAt: Date.now(),
    };
    db.comments.push(c);
    return { ...c, author: publicUser(me) };
  },

  // DELETE /comments/:id
  async deleteComment(token, id) {
    await sleep(160);
    const me = authed(token);
    const c = db.comments.find((x) => x.id === id);
    if (!c) throw new ApiError(404, "Already gone.");
    if (c.authorId !== me.id) throw new ApiError(403, "You can only delete your own comments.");
    db.comments = db.comments.filter((x) => x.id !== id);
    return { ok: true };
  },

  // GET /users/:handle
  async getUser(handle) {
    await sleep(latency());
    const u = db.users.find((x) => x.handle === handle);
    if (!u) throw new ApiError(404, "No one here by that name.");
    return publicUser(u);
  },
};

/* ============================================================
   Markdown
   ============================================================ */

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inlineMd(s) {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function renderMd(src) {
  const lines = (src || "").split("\n");
  const out = [];
  let para = [];
  let list = [];
  let code = null;

  const flushPara = () => {
    if (para.length) {
      out.push("<p>" + inlineMd(para.join(" ")) + "</p>");
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push("<ul>" + list.map((i) => "<li>" + inlineMd(i) + "</li>").join("") + "</ul>");
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (line.trim().startsWith("```")) {
      flushPara();
      flushList();
      if (code === null) code = [];
      else {
        out.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
        code = null;
      }
      continue;
    }
    if (code !== null) {
      code.push(raw);
      continue;
    }
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      const lvl = h[1].length + 1;
      out.push(`<h${lvl}>` + inlineMd(h[2]) + `</h${lvl}>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flushPara();
      flushList();
      out.push("<blockquote>" + inlineMd(line.replace(/^>\s?/, "")) + "</blockquote>");
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  if (code !== null) out.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
  flushPara();
  flushList();
  return out.join("");
}

/* ============================================================
   Small utilities + shared pieces
   ============================================================ */

function timeAgo(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ user, size = 34 }) {
  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={`avatar ink-${user.ink}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function Spinner({ label = "Loading" }) {
  return (
    <div className="spinner-row" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

/* ============================================================
   App
   ============================================================ */

export default function Foolscap() {
  const [session, setSession] = useState(null); // { token, user }
  const [route, setRoute] = useState({ name: "feed" });
  const [authOpen, setAuthOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const mainRef = useRef(null);

  const toast = useCallback((text, tone = "ok") => {
    const id = uid("t");
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const go = useCallback((next) => {
    setRoute(next);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const requireAuth = useCallback(
    (fn) => {
      if (!session) {
        setAuthOpen(true);
        return false;
      }
      fn();
      return true;
    },
    [session]
  );

  const signOut = async () => {
    await api.logout(session.token);
    setSession(null);
    go({ name: "feed" });
    toast("Signed out.");
  };

  return (
    <div className="fs-root">
      <StyleSheet />

      <div className="shell">
        <Rail
          session={session}
          route={route}
          go={go}
          onSignIn={() => setAuthOpen(true)}
          onSignOut={signOut}
          onWrite={() => requireAuth(() => go({ name: "editor", post: null }))}
        />

        <main className="main" ref={mainRef}>
          {route.name === "feed" && (
            <Feed session={session} go={go} query={route.q} tag={route.tag} toast={toast} />
          )}
          {route.name === "post" && (
            <PostView
              id={route.id}
              session={session}
              go={go}
              toast={toast}
              onNeedAuth={() => setAuthOpen(true)}
            />
          )}
          {route.name === "editor" && (
            <Editor post={route.post} session={session} go={go} toast={toast} />
          )}
          {route.name === "profile" && (
            <Profile
              handle={route.handle}
              session={session}
              setSession={setSession}
              go={go}
              toast={toast}
            />
          )}
        </main>
      </div>

      {authOpen && (
        <AuthDialog
          onClose={() => setAuthOpen(false)}
          onDone={(s) => {
            setSession(s);
            setAuthOpen(false);
            toast(`Welcome, ${s.user.name.split(" ")[0]}.`);
          }}
        />
      )}

      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Rail ---------------- */

function Rail({ session, route, go, onSignIn, onSignOut, onWrite }) {
  return (
    <header className="rail">
      <button className="masthead" onClick={() => go({ name: "feed" })} aria-label="Foolscap home">
        <span className="mast-layer mast-b" aria-hidden="true">Foolscap</span>
        <span className="mast-layer mast-p" aria-hidden="true">Foolscap</span>
        <span className="mast-layer mast-k">Foolscap</span>
      </button>
      <p className="mast-sub">Publish what you're still figuring out.</p>

      <nav className="rail-nav">
        <button
          className={"rail-link" + (route.name === "feed" && !route.tag ? " is-on" : "")}
          onClick={() => go({ name: "feed" })}
        >
          Everything
        </button>
        {["writing", "making", "archives", "typography"].map((t) => (
          <button
            key={t}
            className={"rail-link" + (route.tag === t ? " is-on" : "")}
            onClick={() => go({ name: "feed", tag: t })}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="rail-foot">
        <button className="btn btn-ink" onClick={onWrite}>
          Start writing
        </button>
        {session ? (
          <div className="whoami">
            <button
              className="whoami-id"
              onClick={() => go({ name: "profile", handle: session.user.handle })}
            >
              <Avatar user={session.user} size={30} />
              <span>
                <strong>{session.user.name}</strong>
                <small>@{session.user.handle}</small>
              </span>
            </button>
            <button className="linkish" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <button className="btn btn-quiet" onClick={onSignIn}>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}

/* ---------------- Feed ---------------- */

function Feed({ session, go, query, tag, toast }) {
  const [posts, setPosts] = useState(null);
  const [q, setQ] = useState(query || "");
  const [err, setErr] = useState(null);

  useEffect(() => {
    let live = true;
    setPosts(null);
    api
      .listPosts({ tag, q, token: session?.token })
      .then((r) => live && setPosts(r))
      .catch((e) => live && setErr(e.message));
    return () => {
      live = false;
    };
  }, [tag, q, session]);

  return (
    <div className="column">
      <div className="feed-head">
        <h1 className="page-title">{tag ? `Filed under ${tag}` : "Latest"}</h1>
        <div className="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts"
            aria-label="Search posts"
          />
          {q && (
            <button className="linkish" onClick={() => setQ("")}>
              Clear
            </button>
          )}
        </div>
      </div>

      {err && <p className="error-block">{err}</p>}
      {!posts && <Spinner label="Fetching posts" />}
      {posts && posts.length === 0 && (
        <div className="empty">
          <p>Nothing here yet.</p>
          <button className="btn btn-ink" onClick={() => go({ name: "editor", post: null })}>
            Write the first one
          </button>
        </div>
      )}

      <div className="feed">
        {posts?.map((p) => (
          <article key={p.id} className="card">
            <button className="card-hit" onClick={() => go({ name: "post", id: p.id })}>
              <h2>{p.title}</h2>
              {p.subtitle && <p className="card-sub">{p.subtitle}</p>}
            </button>
            <div className="card-meta">
              <button
                className="byline"
                onClick={() => go({ name: "profile", handle: p.author.handle })}
              >
                <Avatar user={p.author} size={26} />
                <span>{p.author.name}</span>
              </button>
              <span className="dot-sep">{timeAgo(p.createdAt)}</span>
              <span className="dot-sep">{p.readingTime} min</span>
              {p.status === "draft" && <span className="tag tag-draft">draft</span>}
              <span className="spacer" />
              {p.tags.map((t) => (
                <button key={t} className="tag" onClick={() => go({ name: "feed", tag: t })}>
                  {t}
                </button>
              ))}
              <span className="count">{p.claps.length} ♦</span>
              <span className="count">{p.commentCount} ✎</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Post ---------------- */

function PostView({ id, session, go, toast, onNeedAuth }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(null);
  const [err, setErr] = useState(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    let live = true;
    setErr(null);
    setPost(null);
    api
      .getPost(id, session?.token)
      .then((p) => live && setPost(p))
      .catch((e) => live && setErr(e.message));
    api.listComments(id).then((c) => live && setComments(c));
    return () => {
      live = false;
    };
  }, [id, session]);

  const clap = async () => {
    if (!session) return onNeedAuth();
    try {
      setPost(await api.toggleClap(session.token, id));
    } catch (e) {
      toast(e.message, "bad");
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!session) return onNeedAuth();
    setPosting(true);
    try {
      const c = await api.addComment(session.token, id, draft);
      setComments((cs) => [...cs, c]);
      setDraft("");
      setPost((p) => ({ ...p, commentCount: p.commentCount + 1 }));
    } catch (e2) {
      toast(e2.message, "bad");
    } finally {
      setPosting(false);
    }
  };

  const removeComment = async (cid) => {
    try {
      await api.deleteComment(session.token, cid);
      setComments((cs) => cs.filter((c) => c.id !== cid));
      setPost((p) => ({ ...p, commentCount: p.commentCount - 1 }));
    } catch (e) {
      toast(e.message, "bad");
    }
  };

  const removePost = async () => {
    try {
      await api.deletePost(session.token, id);
      toast("Post deleted.");
      go({ name: "feed" });
    } catch (e) {
      toast(e.message, "bad");
    }
  };

  if (err)
    return (
      <div className="column">
        <p className="error-block">{err}</p>
        <button className="linkish" onClick={() => go({ name: "feed" })}>
          Back to everything
        </button>
      </div>
    );
  if (!post)
    return (
      <div className="column">
        <Spinner label="Opening post" />
      </div>
    );

  const mine = session?.user.id === post.authorId;
  const clapped = session ? post.claps.includes(session.user.id) : false;

  return (
    <div className="column">
      <button className="linkish back" onClick={() => go({ name: "feed" })}>
        ← Everything
      </button>

      <article className="article">
        <header className="article-head">
          {post.status === "draft" && <span className="tag tag-draft">unpublished draft</span>}
          <h1>{post.title}</h1>
          {post.subtitle && <p className="standfirst">{post.subtitle}</p>}
          <div className="article-meta">
            <button
              className="byline"
              onClick={() => go({ name: "profile", handle: post.author.handle })}
            >
              <Avatar user={post.author} size={38} />
              <span>
                <strong>{post.author.name}</strong>
                <small>
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {post.readingTime} min read
                </small>
              </span>
            </button>
            {mine && (
              <div className="owner-actions">
                <button className="btn btn-quiet" onClick={() => go({ name: "editor", post })}>
                  Edit
                </button>
                {confirmDel ? (
                  <>
                    <button className="btn btn-danger" onClick={removePost}>
                      Delete for good
                    </button>
                    <button className="linkish" onClick={() => setConfirmDel(false)}>
                      Keep it
                    </button>
                  </>
                ) : (
                  <button className="linkish" onClick={() => setConfirmDel(true)}>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMd(post.body) }} />

        <footer className="article-foot">
          <button className={"clap" + (clapped ? " is-on" : "")} onClick={clap}>
            <span className="clap-mark">♦</span>
            {post.claps.length} {post.claps.length === 1 ? "mark" : "marks"}
          </button>
          <div className="tag-row">
            {post.tags.map((t) => (
              <button key={t} className="tag" onClick={() => go({ name: "feed", tag: t })}>
                {t}
              </button>
            ))}
          </div>
        </footer>
      </article>

      <section className="replies">
        <h2 className="section-title">Replies</h2>

        {session ? (
          <form className="reply-form" onSubmit={submitComment}>
            <Avatar user={session.user} size={34} />
            <div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="Say the thing that would make the author reconsider."
                aria-label="Write a reply"
              />
              <button className="btn btn-ink" disabled={posting || !draft.trim()}>
                {posting ? "Posting…" : "Post reply"}
              </button>
            </div>
          </form>
        ) : (
          <p className="signed-out-note">
            <button className="linkish" onClick={onNeedAuth}>
              Sign in
            </button>{" "}
            to reply.
          </p>
        )}

        {!comments && <Spinner label="Loading replies" />}
        {comments?.length === 0 && <p className="empty-line">No replies yet. First word is yours.</p>}
        <ul className="comment-list">
          {comments?.map((c) => (
            <li key={c.id} className="comment">
              <Avatar user={c.author} size={30} />
              <div>
                <div className="comment-head">
                  <button
                    className="linkish"
                    onClick={() => go({ name: "profile", handle: c.author.handle })}
                  >
                    {c.author.name}
                  </button>
                  <span className="muted">{timeAgo(c.createdAt)}</span>
                  {session?.user.id === c.authorId && (
                    <button className="linkish subtle" onClick={() => removeComment(c.id)}>
                      Delete
                    </button>
                  )}
                </div>
                <p>{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------------- Editor ---------------- */

function Editor({ post, session, go, toast }) {
  const [form, setForm] = useState({
    id: post?.id || null,
    title: post?.title || "",
    subtitle: post?.subtitle || "",
    tagText: post?.tags?.join(", ") || "",
    body: post?.body || "",
    status: post?.status || "draft",
  });
  const [fields, setFields] = useState({});
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (status) => {
    setBusy(true);
    setFields({});
    try {
      const saved = await api.savePost(session.token, { ...form, status });
      toast(status === "published" ? "Published." : "Draft saved.");
      go({ name: "post", id: saved.id });
    } catch (e) {
      setFields(e.fields || {});
      toast(e.message, "bad");
    } finally {
      setBusy(false);
    }
  };

  const words = form.body.trim() ? form.body.trim().split(/\s+/).length : 0;

  return (
    <div className="column">
      <div className="editor-bar">
        <button className="linkish" onClick={() => go({ name: "feed" })}>
          ← Leave without saving
        </button>
        <span className="spacer" />
        <span className="muted">{words} words</span>
        <button className="btn btn-quiet" onClick={() => setPreview((p) => !p)}>
          {preview ? "Back to editing" : "Preview"}
        </button>
        <button className="btn btn-quiet" disabled={busy} onClick={() => save("draft")}>
          Save draft
        </button>
        <button className="btn btn-ink" disabled={busy} onClick={() => save("published")}>
          {busy ? "Working…" : "Publish"}
        </button>
      </div>

      {preview ? (
        <article className="article">
          <header className="article-head">
            <h1>{form.title || "Untitled"}</h1>
            {form.subtitle && <p className="standfirst">{form.subtitle}</p>}
          </header>
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMd(form.body) }} />
        </article>
      ) : (
        <div className="editor">
          <input
            className={"input-title" + (fields.title ? " has-error" : "")}
            value={form.title}
            onChange={set("title")}
            placeholder="Title"
            aria-label="Title"
          />
          {fields.title && <p className="field-error">{fields.title}</p>}

          <input
            className="input-sub"
            value={form.subtitle}
            onChange={set("subtitle")}
            placeholder="One line that tells someone whether to keep reading"
            aria-label="Subtitle"
          />

          <input
            className="input-tags"
            value={form.tagText}
            onChange={set("tagText")}
            placeholder="Tags, comma separated — up to four"
            aria-label="Tags"
          />

          <textarea
            className={"input-body" + (fields.body ? " has-error" : "")}
            value={form.body}
            onChange={set("body")}
            rows={22}
            placeholder={"Write here.\n\n## Headings with ##\n**bold**, *italic*, `code`\n> pull quotes with >\n- lists with -"}
            aria-label="Post body"
          />
          {fields.body && <p className="field-error">{fields.body}</p>}
          <p className="hint">
            Markdown: <code>##</code> heading, <code>**bold**</code>, <code>*italic*</code>,{" "}
            <code>&gt;</code> quote, <code>-</code> list, <code>```</code> code block.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Profile ---------------- */

function Profile({ handle, session, setSession, go, toast }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");

  useEffect(() => {
    let live = true;
    setUser(null);
    api.getUser(handle).then((u) => {
      if (!live) return;
      setUser(u);
      setBio(u.bio);
    });
    api.listPosts({ authorHandle: handle, token: session?.token }).then((p) => live && setPosts(p));
    return () => {
      live = false;
    };
  }, [handle, session]);

  const saveBio = async () => {
    try {
      const u = await api.updateProfile(session.token, { bio });
      setUser(u);
      setSession((s) => ({ ...s, user: u }));
      setEditing(false);
      toast("Profile updated.");
    } catch (e) {
      toast(e.message, "bad");
    }
  };

  if (!user)
    return (
      <div className="column">
        <Spinner label="Loading profile" />
      </div>
    );

  const mine = session?.user.id === user.id;
  const published = posts?.filter((p) => p.status === "published") || [];
  const drafts = posts?.filter((p) => p.status === "draft") || [];

  return (
    <div className="column">
      <div className="profile-head">
        <Avatar user={user} size={72} />
        <div>
          <h1 className="page-title">{user.name}</h1>
          <p className="muted">
            @{user.handle} · joined {new Date(user.joined).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
          {editing ? (
            <div className="bio-edit">
              <textarea
                value={bio}
                rows={3}
                maxLength={240}
                onChange={(e) => setBio(e.target.value)}
                aria-label="Bio"
              />
              <div>
                <button className="btn btn-ink" onClick={saveBio}>
                  Save bio
                </button>
                <button className="linkish" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="bio">{user.bio || (mine ? "Nothing here yet." : "")}</p>
              {mine && (
                <button className="linkish" onClick={() => setEditing(true)}>
                  Edit bio
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <h2 className="section-title">
        {published.length} published{mine && drafts.length ? ` · ${drafts.length} in progress` : ""}
      </h2>

      {!posts && <Spinner label="Loading posts" />}
      <div className="feed">
        {posts?.map((p) => (
          <article key={p.id} className="card">
            <button className="card-hit" onClick={() => go({ name: "post", id: p.id })}>
              <h2>{p.title}</h2>
              {p.subtitle && <p className="card-sub">{p.subtitle}</p>}
            </button>
            <div className="card-meta">
              <span className="dot-sep">{timeAgo(p.createdAt)}</span>
              <span className="dot-sep">{p.readingTime} min</span>
              {p.status === "draft" && <span className="tag tag-draft">draft</span>}
              <span className="spacer" />
              <span className="count">{p.claps.length} ♦</span>
              <span className="count">{p.commentCount} ✎</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Auth ---------------- */

function AuthDialog({ onClose, onDone }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    handle: "",
    email: "mara@foolscap.dev",
    password: "letmein!",
  });
  const [fields, setFields] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    try {
      const res = mode === "login" ? await api.login(form) : await api.signup(form);
      onDone(res);
    } catch (err) {
      setError(err.message);
      setFields(err.fields || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Sign in to Foolscap">
        <div className="dialog-tabs">
          <button
            className={mode === "login" ? "is-on" : ""}
            onClick={() => {
              setMode("login");
              setFields({});
              setError(null);
            }}
          >
            Sign in
          </button>
          <button
            className={mode === "signup" ? "is-on" : ""}
            onClick={() => {
              setMode("signup");
              setFields({});
              setError(null);
            }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="dialog-body">
          {mode === "signup" && (
            <>
              <label>
                Name
                <input ref={firstRef} value={form.name} onChange={set("name")} autoComplete="name" />
                {fields.name && <span className="field-error">{fields.name}</span>}
              </label>
              <label>
                Handle
                <input
                  value={form.handle}
                  onChange={set("handle")}
                  placeholder="lowercase, no spaces"
                />
                {fields.handle && <span className="field-error">{fields.handle}</span>}
              </label>
            </>
          )}
          <label>
            Email
            <input
              ref={mode === "login" ? firstRef : null}
              type="email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
            />
            {fields.email && <span className="field-error">{fields.email}</span>}
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            {fields.password && <span className="field-error">{fields.password}</span>}
          </label>

          {error && <p className="error-block">{error}</p>}

          <button className="btn btn-ink btn-wide" disabled={busy}>
            {busy ? "Checking…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          {mode === "login" && (
            <p className="demo-note">
              Three accounts are already seeded. Sign in as{" "}
              <code>mara@foolscap.dev</code>, <code>tev@foolscap.dev</code> or{" "}
              <code>ines@foolscap.dev</code> — password <code>letmein!</code> for all of them.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   Styles
   ============================================================ */

function StyleSheet() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap');

.fs-root {
  --paper: #E9EAE5;
  --paper-2: #F2F2EE;
  --ink: #17171C;
  --blue: #2340D9;
  --pink: #FF4E87;
  --green: #0E8A5F;
  --slate: #75776F;
  --rule: #C9CAC2;

  --sans: 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif;
  --serif: 'Newsreader', Georgia, serif;

  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  min-height: 100vh;
  position: relative;
}
.fs-root::before {
  content: "";
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: radial-gradient(var(--ink) 0.5px, transparent 0.5px);
  background-size: 4px 4px;
  opacity: .05;
}
.fs-root *, .fs-root *::before, .fs-root *::after { box-sizing: border-box; }
.fs-root button { font-family: inherit; cursor: pointer; }
.fs-root :focus-visible { outline: 2.5px solid var(--blue); outline-offset: 2px; border-radius: 2px; }

.shell { position: relative; z-index: 1; display: grid; grid-template-columns: 268px 1fr; min-height: 100vh; max-width: 1180px; margin: 0 auto; }

/* ---- rail ---- */
.rail { border-right: 1px solid var(--rule); padding: 30px 26px 26px; display: flex; flex-direction: column; gap: 22px; position: sticky; top: 0; height: 100vh; }
.masthead { background: none; border: 0; padding: 0; text-align: left; position: relative; line-height: .92; }
.mast-layer { display: block; font-size: 40px; font-weight: 800; letter-spacing: -0.035em; font-family: var(--sans); }
.mast-b, .mast-p { position: absolute; top: 0; left: 0; mix-blend-mode: multiply; }
.mast-b { color: var(--blue); transform: translate(-2.5px, 1.5px); }
.mast-p { color: var(--pink); transform: translate(2px, -1.5px); }
.mast-k { color: var(--ink); position: relative; }
.masthead:hover .mast-b { transform: translate(-4px, 2.5px); }
.masthead:hover .mast-p { transform: translate(3.5px, -2.5px); }
.mast-layer { transition: transform .18s ease; }
.mast-sub { font-family: var(--serif); font-style: italic; font-size: 14px; color: var(--slate); margin: -10px 0 0; max-width: 20ch; line-height: 1.4; }

.rail-nav { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; border-top: 1px solid var(--rule); padding-top: 16px; }
.rail-link { background: none; border: 0; padding: 5px 8px; margin-left: -8px; font-size: 14.5px; color: var(--slate); border-radius: 6px; }
.rail-link:hover { color: var(--ink); background: rgba(0,0,0,.04); }
.rail-link.is-on { color: var(--ink); font-weight: 600; box-shadow: inset 2px 0 0 var(--blue); border-radius: 0 6px 6px 0; }

.rail-foot { margin-top: auto; display: flex; flex-direction: column; gap: 14px; }
.whoami { display: flex; align-items: center; gap: 10px; justify-content: space-between; border-top: 1px solid var(--rule); padding-top: 12px; }
.whoami-id { display: flex; align-items: center; gap: 9px; background: none; border: 0; padding: 0; text-align: left; }
.whoami-id strong { display: block; font-size: 13.5px; font-weight: 600; }
.whoami-id small { display: block; font-size: 12px; color: var(--slate); }

/* ---- main ---- */
.main { overflow-y: auto; height: 100vh; }
.column { max-width: 660px; padding: 34px 40px 96px; }
.page-title { font-size: 30px; font-weight: 600; letter-spacing: -0.025em; margin: 0; }
.section-title { font-size: 16px; font-weight: 600; margin: 40px 0 14px; padding-bottom: 8px; border-bottom: 1px solid var(--rule); }

.feed-head { display: flex; align-items: baseline; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 22px; }
.search { display: flex; align-items: center; gap: 8px; }
.search input { font-family: var(--sans); font-size: 14px; padding: 7px 12px; border: 1px solid var(--rule); background: var(--paper-2); border-radius: 999px; width: 190px; color: var(--ink); }
.search input::placeholder { color: var(--slate); }

.feed { display: flex; flex-direction: column; }
.card { border-bottom: 1px solid var(--rule); padding: 22px 0; }
.card:first-child { border-top: 1px solid var(--rule); }
.card-hit { display: block; width: 100%; text-align: left; background: none; border: 0; padding: 0; }
.card-hit h2 { font-family: var(--serif); font-size: 23px; font-weight: 600; line-height: 1.22; margin: 0; letter-spacing: -0.01em; }
.card-hit:hover h2 { color: var(--blue); }
.card-sub { font-family: var(--serif); font-size: 16px; color: var(--slate); line-height: 1.5; margin: 7px 0 0; }
.card-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 14px; font-size: 12.5px; color: var(--slate); }
.spacer { flex: 1; }
.byline { display: inline-flex; align-items: center; gap: 7px; background: none; border: 0; padding: 0; font-size: 12.5px; color: var(--ink); }
.byline:hover { color: var(--blue); }
.byline strong { display: block; font-size: 14px; font-weight: 600; }
.byline small { display: block; font-size: 12.5px; color: var(--slate); font-weight: 400; }
.dot-sep::before { content: "·"; margin-right: 10px; }
.count { font-size: 12px; color: var(--slate); }

.tag { font-size: 11.5px; font-family: var(--sans); background: var(--paper-2); border: 1px solid var(--rule); color: var(--slate); padding: 3px 9px; border-radius: 999px; }
.tag:hover { border-color: var(--ink); color: var(--ink); }
.tag-draft { background: var(--pink); border-color: var(--pink); color: #fff; font-weight: 600; }

/* ---- article ---- */
.back { margin-bottom: 20px; display: inline-block; }
.article-head h1 { font-family: var(--serif); font-size: 40px; line-height: 1.1; font-weight: 600; letter-spacing: -0.022em; margin: 8px 0 0; }
.standfirst { font-family: var(--serif); font-size: 19px; font-style: italic; color: var(--slate); line-height: 1.5; margin: 14px 0 0; }
.article-meta { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 26px 0 30px; padding-bottom: 22px; border-bottom: 2px solid var(--ink); }
.owner-actions { display: flex; align-items: center; gap: 10px; }

.prose { font-family: var(--serif); font-size: 18.5px; line-height: 1.72; }
.prose p { margin: 0 0 1.15em; }
.prose h2 { font-family: var(--sans); font-size: 20px; font-weight: 600; letter-spacing: -0.012em; line-height: 1.3; margin: 2em 0 .6em; }
.prose h3 { font-family: var(--sans); font-size: 17px; font-weight: 600; margin: 1.6em 0 .5em; }
.prose ul { margin: 0 0 1.15em; padding-left: 1.1em; }
.prose li { margin-bottom: .4em; }
.prose li::marker { color: var(--pink); }
.prose blockquote { margin: 1.6em 0; padding: 2px 0 2px 20px; border-left: 3px solid var(--blue); font-size: 21px; line-height: 1.5; color: var(--ink); }
.prose code { font-family: ui-monospace, monospace; font-size: .84em; background: var(--paper-2); border: 1px solid var(--rule); padding: 1px 5px; border-radius: 4px; }
.prose pre { background: var(--ink); color: var(--paper); padding: 18px 20px; border-radius: 8px; overflow-x: auto; margin: 1.6em 0; }
.prose pre code { background: none; border: 0; color: inherit; font-size: 13.5px; line-height: 1.6; padding: 0; }
.prose a { color: var(--blue); text-decoration-thickness: 1px; text-underline-offset: 2px; }
.prose strong { font-weight: 600; }

.article-foot { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 44px; padding-top: 22px; border-top: 1px solid var(--rule); }
.tag-row { display: flex; gap: 7px; flex-wrap: wrap; margin-left: auto; }
.clap { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; background: var(--paper-2); border: 1px solid var(--rule); color: var(--slate); padding: 8px 16px; border-radius: 999px; }
.clap:hover { border-color: var(--ink); color: var(--ink); }
.clap.is-on { background: var(--blue); border-color: var(--blue); color: #fff; }
.clap-mark { font-size: 12px; }
.clap.is-on .clap-mark { animation: pop .3s ease; }
@keyframes pop { 0% { transform: scale(1) } 45% { transform: scale(1.7) rotate(15deg) } 100% { transform: scale(1) } }

/* ---- replies ---- */
.reply-form { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 30px; }
.reply-form > div { flex: 1; }
.fs-root textarea, .fs-root .input-title, .fs-root .input-sub, .fs-root .input-tags { width: 100%; font-family: var(--sans); color: var(--ink); background: var(--paper-2); border: 1px solid var(--rule); border-radius: 8px; padding: 11px 13px; font-size: 15px; resize: vertical; }
.fs-root textarea::placeholder { color: var(--slate); }
.reply-form button { margin-top: 9px; }

.comment-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 22px; }
.comment { display: flex; gap: 12px; }
.comment > div { flex: 1; }
.comment-head { display: flex; align-items: center; gap: 10px; font-size: 13px; margin-bottom: 4px; }
.comment p { font-family: var(--serif); font-size: 16.5px; line-height: 1.6; margin: 0; }
.muted { color: var(--slate); font-size: 12.5px; }
.empty-line, .signed-out-note { color: var(--slate); font-size: 14.5px; }

/* ---- editor ---- */
.editor-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding-bottom: 16px; margin-bottom: 22px; border-bottom: 1px solid var(--rule); }
.editor { display: flex; flex-direction: column; gap: 12px; }
.input-title { font-family: var(--serif) !important; font-size: 30px !important; font-weight: 600; background: transparent !important; border: 0 !important; border-bottom: 1px solid var(--rule) !important; border-radius: 0 !important; padding: 6px 0 !important; }
.input-sub { font-family: var(--serif) !important; font-style: italic; font-size: 17px !important; background: transparent !important; border: 0 !important; border-bottom: 1px solid var(--rule) !important; border-radius: 0 !important; padding: 6px 0 !important; color: var(--slate); }
.input-tags { font-size: 14px !important; }
.input-body { font-family: var(--serif) !important; font-size: 17px !important; line-height: 1.7; min-height: 420px; }
.has-error { border-color: var(--pink) !important; }
.field-error { color: var(--pink); font-size: 12.5px; margin: 2px 0 0; font-weight: 600; }
.hint { font-size: 12.5px; color: var(--slate); }
.hint code { font-family: ui-monospace, monospace; background: var(--paper-2); border: 1px solid var(--rule); padding: 0 4px; border-radius: 3px; }

/* ---- profile ---- */
.profile-head { display: flex; gap: 20px; align-items: flex-start; padding-bottom: 26px; border-bottom: 2px solid var(--ink); }
.bio { font-family: var(--serif); font-size: 16.5px; line-height: 1.6; margin: 12px 0 6px; max-width: 46ch; }
.bio-edit { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
.bio-edit > div { display: flex; gap: 12px; align-items: center; }

/* ---- buttons ---- */
.btn { font-size: 13.5px; font-weight: 600; padding: 9px 17px; border-radius: 999px; border: 1px solid transparent; transition: transform .12s ease; }
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: .45; cursor: not-allowed; }
.btn-ink { background: var(--ink); color: var(--paper); }
.btn-ink:hover:not(:disabled) { background: var(--blue); }
.btn-quiet { background: transparent; border-color: var(--rule); color: var(--ink); }
.btn-quiet:hover:not(:disabled) { border-color: var(--ink); }
.btn-danger { background: var(--pink); color: #fff; }
.btn-wide { width: 100%; padding: 12px; }
.linkish { background: none; border: 0; padding: 0; font-size: 13.5px; color: var(--slate); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.linkish:hover { color: var(--blue); }
.linkish.subtle { font-size: 12px; }

/* ---- avatar ---- */
.avatar { display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 700; color: #fff; flex: none; letter-spacing: .01em; }
.ink-blue { background: var(--blue); }
.ink-pink { background: var(--pink); }
.ink-green { background: var(--green); }

/* ---- dialog ---- */
.scrim { position: fixed; inset: 0; background: rgba(23,23,28,.45); display: grid; place-items: center; padding: 20px; z-index: 50; }
.dialog { background: var(--paper); border: 1.5px solid var(--ink); border-radius: 14px; width: 100%; max-width: 400px; overflow: hidden; box-shadow: 8px 8px 0 var(--blue); }
.dialog-tabs { display: flex; border-bottom: 1px solid var(--rule); }
.dialog-tabs button { flex: 1; background: none; border: 0; padding: 14px; font-size: 14px; font-weight: 600; color: var(--slate); }
.dialog-tabs button.is-on { color: var(--ink); box-shadow: inset 0 -2.5px 0 var(--pink); }
.dialog-body { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
.dialog-body label { display: flex; flex-direction: column; gap: 5px; font-size: 12.5px; font-weight: 600; color: var(--slate); }
.dialog-body input { font-family: var(--sans); font-size: 15px; padding: 10px 12px; border: 1px solid var(--rule); background: var(--paper-2); border-radius: 8px; color: var(--ink); }
.demo-note { font-size: 12px; color: var(--slate); line-height: 1.55; margin: 0; }
.demo-note code { font-family: ui-monospace, monospace; font-size: 11px; background: var(--paper-2); border: 1px solid var(--rule); padding: 1px 4px; border-radius: 3px; }

/* ---- feedback ---- */
.error-block { background: var(--pink); color: #fff; font-size: 13.5px; font-weight: 500; padding: 10px 13px; border-radius: 8px; margin: 0; }
.empty { border: 1px dashed var(--rule); border-radius: 12px; padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; color: var(--slate); }
.spinner-row { display: flex; align-items: center; gap: 10px; color: var(--slate); font-size: 13.5px; padding: 24px 0; }
.spinner { width: 13px; height: 13px; border-radius: 50%; border: 2px solid var(--rule); border-top-color: var(--blue); animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }

.toasts { position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; z-index: 60; align-items: center; }
.toast { background: var(--ink); color: var(--paper); font-size: 13.5px; font-weight: 500; padding: 10px 18px; border-radius: 999px; animation: rise .22s ease; }
.toast-bad { background: var(--pink); }
@keyframes rise { from { opacity: 0; transform: translateY(8px) } }

/* ---- responsive ---- */
@media (max-width: 860px) {
  .shell { grid-template-columns: 1fr; }
  .rail { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--rule); padding: 22px 22px 18px; }
  .rail-foot { margin-top: 18px; flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  .whoami { border-top: 0; padding-top: 0; }
  .rail-nav { flex-direction: row; flex-wrap: wrap; }
  .rail-link.is-on { box-shadow: inset 0 -2px 0 var(--blue); border-radius: 6px; }
  .main { height: auto; overflow: visible; }
  .column { padding: 24px 22px 80px; }
  .article-head h1 { font-size: 30px; }
  .mast-layer { font-size: 34px; }
}
@media (prefers-reduced-motion: reduce) {
  .fs-root *, .fs-root *::before { animation: none !important; transition: none !important; }
}
`}</style>
  );
}
