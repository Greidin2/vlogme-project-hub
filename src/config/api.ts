export const apiConfig = {
  me: "/api/me",
  roles: "/api/roles",
  accessEntries: "/api/admin/access-entries",
  reports: "/api/reports",
  meetings: "/api/meetings",
  reportFile(fileId: string) {
    return `/api/files/${encodeURIComponent(fileId)}`;
  },
};
