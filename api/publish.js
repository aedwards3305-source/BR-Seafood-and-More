module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth: admin sends PASSWORD_HASH as Bearer token
  const authHeader = req.headers.authorization;
  const PUBLISH_SECRET = process.env.PUBLISH_SECRET;

  if (!PUBLISH_SECRET || authHeader !== 'Bearer ' + PUBLISH_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return res.status(500).json({
      error: 'Publishing not configured. Set GITHUB_TOKEN and GITHUB_REPO in Vercel environment variables.'
    });
  }

  const { type, data } = req.body;

  const fileMap = {
    menu: 'data/menu.json',
    events: 'data/events.json',
    settings: 'data/site-settings.json'
  };

  const filePath = fileMap[type];
  if (!filePath) return res.status(400).json({ error: 'Invalid type' });

  try {
    // Get current file SHA (required by GitHub API for updates)
    const getResp = await fetch(
      'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + filePath,
      {
        headers: {
          Authorization: 'token ' + GITHUB_TOKEN,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    let sha = null;
    if (getResp.ok) {
      const fileInfo = await getResp.json();
      sha = fileInfo.sha;
    }

    // Commit the updated file
    const content = Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64');
    const commitBody = {
      message: 'Update ' + type + ' via admin panel',
      content: content
    };
    if (sha) commitBody.sha = sha;

    const putResp = await fetch(
      'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + filePath,
      {
        method: 'PUT',
        headers: {
          Authorization: 'token ' + GITHUB_TOKEN,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commitBody)
      }
    );

    if (!putResp.ok) {
      const err = await putResp.json();
      return res.status(putResp.status).json({ error: err.message || 'GitHub API error' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
