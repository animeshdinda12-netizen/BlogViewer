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
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.content) {
            throw new Error('Invalid response from GitHub API');
        }

        let posts;
        try {
            const decoded = atob(data.content);
            posts = JSON.parse(decoded);
        } catch (parseError) {
            throw new Error(`Failed to parse posts data: ${parseError.message}`);
        }

        if (!Array.isArray(posts)) {
            throw new Error('Posts data is not an array');
        }

        if (JSON.stringify(posts) === JSON.stringify(lastPosts)) {
            // No changes, don't update DOM
            return;
        }

        lastPosts = posts;

        if (posts.length === 0) {
            container.innerHTML = '<div class="no-posts">No posts yet. Check back later!</div>';
            return;
        }

        // Build HTML with error handling for each post
        let html = '';
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            try {
                if (!post || typeof post !== 'object') {
                    console.error('Invalid post at index', i, post);
                    continue;
                }
                
                const content = post.content !== undefined && post.content !== null 
                    ? String(post.content) 
                    : '';
                
                const timestamp = post.timestamp !== undefined && post.timestamp !== null 
                    ? new Date(post.timestamp) 
                    : new Date();
                
                const timestampStr = !isNaN(timestamp.getTime()) 
                    ? timestamp.toLocaleString() 
                    : 'Invalid date';
                
                const imageHtml = post.image !== undefined && post.image !== null && typeof post.image === 'string' && post.image.trim() !== ''
                    ? `<img src="${post.image.trim()}" alt="Post image" class="post-image">`
                    : '';
                
                html += `
                    <div class="post">
                        ${imageHtml}
                        <div class="post-content">${content}</div>
                        <div class="post-timestamp">${timestampStr}</div>
                    </div>
                `;
            } catch (postError) {
                console.error('Error processing post at index', i, postError, post);
                // Continue with other posts
            }
        }

        container.innerHTML = html;

    } catch (err) {
        console.error('Error in loadPosts:', err);
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