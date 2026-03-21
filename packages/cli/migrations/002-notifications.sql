CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    extension_name TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    variant TEXT NOT NULL DEFAULT 'info' CHECK(variant IN ('info', 'success', 'warning', 'error')),
    action_url TEXT,
    read INTEGER NOT NULL DEFAULT 0 CHECK(read IN (0, 1)),
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
