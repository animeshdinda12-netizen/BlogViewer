const USER = 'animeshdinda12-netizen';
const REPO = 'BlogViewer';
let lastPosts = null;

async function loadPosts() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const container = document.getElementById('postsContainer');

    loading.style.display = 'block';
    error.style.display = 'none';

    try {
        const response = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/posts.json`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                container.innerHTML = '<div class="no-posts">No posts yet. Check back later!</div>';
                return;
            }
            throw new Error('Failed to load posts');
        }

        const data = await response.json();
        const posts = JSON.parse(atob(data.content));

        if (JSON.stringify(posts) === JSON.stringify(lastPosts)) {
            // No changes, don't update DOM
            return;
        }

        lastPosts = posts;

        if (posts.length === 0) {
            container.innerHTML = '<div class="no-posts">No posts yet. Check back later!</div>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="post">
                ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
                <div class="post-content">${post.content}</div>
                <div class="post-timestamp">${new Date(post.timestamp).toLocaleString()}</div>
            </div>
        `).join('');

    } catch (err) {
        error.textContent = 'Error loading posts: ' + err.message;
        error.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

// Load posts initially
loadPosts();

// Auto-refresh every 10 seconds
setInterval(loadPosts, 10000);