# Complete the user chat UI

## Scope
Only the production user-chat experience will change. The existing `/` demo, Chat Manager, AMS Manager, and unrelated modules remain untouched.

## Build
- Add a dedicated `/chat` screen connected to the existing authenticated user, real conversations, messages, permissions, presence, and preferences.
- Build the three-pane Jira-style workspace: compact conversation list, focused message area, and a contextual details panel for participants and shared files.
- Add mobile navigation so the list, conversation, thread, and details views remain usable without overlap.
- Wire the existing slim composer, message groups, attachments, mentions, reactions, bookmarks, immutable-record state, retries, typing, and receipts into the workspace.
- Add in-conversation search with result navigation and message highlighting.
- Add header translation controls, real-time translation state, presence heartbeat, sound cues, profile editing, preferences, and new-conversation flow.
- Add thread replies in a focused side panel without allowing message edits or deletion.
- Add complete loading, empty, signed-out, permission-denied, offline, and error states.

## Verification
- Check metadata for the new content route.
- Validate the preview on desktop and mobile.
- Verify available end-to-end flows: sign-in state, conversation selection, search, send/receive, receipts, translation, profile/settings, and compact composer behavior.
- Review the latest build diagnostics and fix any errors before completion.

## Technical details
- Reuse the existing real chat services, realtime hooks, private storage, and permission checks.
- Keep dark mode as the default while preserving the user’s saved preference.
- Do not add mock rows, fake actions, or fallback APIs.
