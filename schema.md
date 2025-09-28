# PlayLoud Database Schema

## Overview
PlayLoud uses Appwrite as its backend service for authentication, database, and file storage.

## Collections

### 1. users
Stores user profile information. Authentication is handled by Appwrite Auth.

| Attribute | Type | Required | Size | Description |
|-----------|------|----------|------|-------------|
| userId | String | Yes | 36 | Unique user ID from Appwrite Auth |
| username | String | Yes | 50 | Unique username |
| email | String | Yes | 254 | User email address |
| avatarUrl | String | No | 500 | Profile picture URL |
| createdAt | DateTime | Yes | - | Account creation timestamp |

**Indexes:**
- username_idx (Key): username
- email_idx (Key): email  
- userId_idx (Key): userId

### 2. songs
Central collection for all music tracks.

| Attribute | Type | Required | Size | Description |
|-----------|------|----------|------|-------------|
| title | String | Yes | 200 | Song title |
| artist | String | Yes | 200 | Artist name |
| album | String | No | 200 | Album name |
| genre | String | Yes | 50 | Music genre |
| duration | Integer | Yes | - | Duration in seconds |
| audioFileId | String | Yes | 36 | Reference to audio file in storage |
| coverImageId | String | No | 36 | Reference to cover image |
| uploadedAt | DateTime | Yes | - | Upload timestamp |

**Indexes:**
- title_idx (Fulltext): title
- artist_idx (Key): artist
- genre_idx (Key): genre

### 3. playlists
User-created playlist metadata.

| Attribute | Type | Required | Size | Description |
|-----------|------|----------|------|-------------|
| name | String | Yes | 100 | Playlist name |
| userId | String | Yes | 36 | Owner's user ID |
| description | String | No | 500 | Playlist description |
| coverImageId | String | No | 36 | Custom cover image |
| isPublic | Boolean | Yes | - | Public visibility |
| createdAt | DateTime | Yes | - | Creation timestamp |
| updatedAt | DateTime | Yes | - | Last update timestamp |

**Indexes:**
- userId_idx (Key): userId
- name_idx (Fulltext): name

### 4. playlist_songs
Junction table linking songs to playlists.

| Attribute | Type | Required | Size | Description |
|-----------|------|----------|------|-------------|
| playlistId | String | Yes | 36 | Playlist ID |
| songId | String | Yes | 36 | Song ID |
| position | Integer | Yes | - | Order in playlist (0-based) |
| addedAt | DateTime | Yes | - | When song was added |

**Indexes:**
- playlist_idx (Key): playlistId
- song_idx (Key): songId
- position_idx (Key): playlistId, position

### 5. liked_songs
Tracks user's favorite songs.

| Attribute | Type | Required | Size | Description |
|-----------|------|----------|------|-------------|
| userId | String | Yes | 36 | User ID |
| songId | String | Yes | 36 | Song ID |
| likedAt | DateTime | Yes | - | When liked |

**Indexes:**
- user_idx (Key): userId
- song_idx (Key): songId
- unique_idx (Unique): userId, songId

### 6. recently_played
User's listening history.

| Attribute | Type | Required | Size | Description |
|-----------|------|----------|------|-------------|
| userId | String | Yes | 36 | User ID |
| songId | String | Yes | 36 | Song ID |
| playedAt | DateTime | Yes | - | Play timestamp |

**Indexes:**
- user_time_idx (Key): userId, playedAt (DESC)

### 7. genres
Music categories for organization.

| Attribute | Type | Required | Size | Description |
|-----------|------|----------|------|-------------|
| name | String | Yes | 50 | Genre identifier |
| displayName | String | Yes | 50 | Display name |
| color | String | Yes | 7 | Hex color (#RRGGBB) |
| imageUrl | String | No | 500 | Genre cover image |

**Indexes:**
- name_idx (Unique): name

### 8. premium
Premium subscription tracking.

| Attribute | Type | Required | Size | Description |
|-----------|------|----------|------|-------------|
| userId | String | Yes | 36 | User ID |
| status | String | Yes | 20 | active/expired/cancelled |
| startDate | DateTime | Yes | - | Subscription start |
| endDate | DateTime | Yes | - | Subscription end |
| paymentMethod | String | No | 50 | Payment method used |
| amount | Float | Yes | - | Payment amount |

**Indexes:**
- userId_idx (Unique): userId
- status_idx (Key): status

## Storage Buckets

### audio-files
- **Purpose:** Store music files
- **Max Size:** 50MB per file
- **Allowed:** .mp3, .wav, .m4a
- **Permissions:** Read (Any), Create (Users)

### images
- **Purpose:** Store cover art and avatars
- **Max Size:** 5MB per file
- **Allowed:** .jpg, .jpeg, .png, .webp
- **Permissions:** Read (Any), Create (Users)

## Permissions Strategy

1. **users:** Read (Any), Write (Account owner)
2. **songs:** Read (Any), Write (Admin)
3. **playlists:** Read (Public: Any, Private: Owner), Write (Owner)
4. **playlist_songs:** Read/Write (Playlist owner)
5. **liked_songs:** Read/Write (User)
6. **recently_played:** Read/Write (User)
7. **genres:** Read (Any), Write (Admin)
8. **premium:** Read (User), Write (Admin/System)

## Security Rules

- User can only modify their own data
- Songs are read-only for users (admin uploads)
- Private playlists visible only to owner
- Premium status managed by payment system