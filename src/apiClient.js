// Project AINA - Frontend API Client for Backend Services
// Connects to /api endpoints with graceful offline fallback

const API_BASE = '/api';

export const apiClient = {
  async health() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async diagnoseIssue(input, context = {}, apiKey = '', model = 'gemini-1.5-flash') {
    const res = await fetch(`${API_BASE}/ai/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-gemini-api-key': apiKey } : {})
      },
      body: JSON.stringify({
        input,
        apiKey,
        model,
        context
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Diagnose failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.data;
  },

  async saveCase(caseData) {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to save complaint to database.');
    }

    return await res.json();
  },

  async getCase(trackingId) {
    const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(trackingId.trim())}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Case ${trackingId} not found.`);
    }
    const data = await res.json();
    return data.data;
  },

  async searchCases(query = '', category = 'all', status = 'all') {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category && category !== 'all') params.set('category', category);
    if (status && status !== 'all') params.set('status', status);

    const res = await fetch(`${API_BASE}/cases?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  },

  async updateCaseStatus(trackingId, { status, diaryNumber, note, officer }) {
    const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(trackingId.trim())}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, diaryNumber, note, officer })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to update case status.');
    }

    const data = await res.json();
    return data.data;
  },

  async exportPetition(trackingId, lang = 'en') {
    const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(trackingId.trim())}/export?lang=${lang}`);
    if (!res.ok) {
      throw new Error('Failed to fetch petition export.');
    }
    return await res.text();
  },

  async getAnalytics() {
    try {
      const res = await fetch(`${API_BASE}/analytics/overview`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.data;
    } catch {
      return null;
    }
  }
};
