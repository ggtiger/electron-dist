export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Electron App Distribution Platform</h1>
      <p>API server is running.</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li>GET /api - API status</li>
        <li>POST /api/apps - Create app</li>
        <li>GET /api/apps - List apps</li>
        <li>DELETE /api/apps/:appId - Delete app</li>
        <li>POST /api/apps/:appId/versions - Create version</li>
        <li>GET /api/apps/:appId/versions - List versions</li>
        <li>GET /api/apps/:appId/versions/:versionId - Get version</li>
        <li>DELETE /api/apps/:appId/versions/:versionId - Delete version</li>
        <li>POST /api/uploads/installer - Upload installer</li>
        <li>POST /api/uploads/patch - Upload patch</li>
        <li>GET /api/check - Check for updates</li>
        <li>GET /api/files/:fileId/download-url - Get download URL</li>
      </ul>
    </main>
  );
}
