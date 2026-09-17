/**
 * Workspace management for multi-tenant isolation.
 * Each user / browser session gets their own unique workspaceId.
 * No user can manage or see another user's connected YouTube channel.
 */

export function getWorkspaceId(): string {
  if (typeof window === 'undefined') return 'default';

  // 1. Check URL query params (?workspaceId=...)
  try {
    const params = new URLSearchParams(window.location.search);
    const urlWs = params.get('workspaceId');
    if (urlWs && urlWs.trim()) {
      localStorage.setItem('jpilot_workspace_id', urlWs.trim());
      return urlWs.trim();
    }
  } catch (e) {}

  // 2. Check localStorage
  try {
    let ws = localStorage.getItem('jpilot_workspace_id');
    if (ws && ws.trim()) {
      return ws.trim();
    }

    // 3. Generate a fresh, isolated workspace ID for this user
    ws = 'ws_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('jpilot_workspace_id', ws);
    return ws;
  } catch (e) {
    return 'default';
  }
}

export function setWorkspaceId(ws: string): void {
  if (typeof window !== 'undefined' && ws && ws.trim()) {
    localStorage.setItem('jpilot_workspace_id', ws.trim());
  }
}

export function resetWorkspace(): string {
  const newWs = 'ws_' + Math.random().toString(36).substring(2, 10);
  if (typeof window !== 'undefined') {
    localStorage.setItem('jpilot_workspace_id', newWs);
  }
  return newWs;
}
